from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from app.core.database import get_db, get_redis
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    generate_otp,
    generate_password_reset_token,
    generate_jti,
    get_password_hash,
    verify_password
)
from app.core.exceptions import UnauthorizedException, ValidationException
from app.core.dependencies import get_current_user, require_admin
from app.core.rate_limiter import rate_limiter
from app.core.account_security import account_security
from app.core.session_manager import session_manager
from app.core.audit_logger import audit_logger
from app.models.audit_log import AuditAction, AuditStatus
from app.schemas.auth import (
    OTPRequest,
    OTPVerify,
    EmailOTPRequest,
    EmailOTPVerify,
    CitizenSignupRequest,
    PhoneVerifyRequest,
    LoginRequest,
    Token,
    RefreshTokenRequest,
    PasswordResetRequest,
    PasswordResetVerify,
    ChangePasswordRequest,
    PortalType
)
from app.schemas.user import OfficerCreate, UserProfileUpdate
from app.crud.user import user_crud
from app.models.user import UserRole
from app.config import settings
from app.core.background_tasks import (
    send_otp_sms_bg,
    send_otp_email_bg,
    update_login_stats_bg
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/request-email-otp", status_code=status.HTTP_200_OK)
async def request_email_otp(
    request: EmailOTPRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Request OTP for email address with rate limiting"""
    # Assuming same rate limit rules for email
    await rate_limiter.check_otp_rate_limit(request.email)
    
    redis_client = await get_redis()

    # Generate OTP
    otp = generate_otp()
    redis_key = f"email_otp:{request.email}"

    # Store OTP in Redis with expiry
    await redis_client.setex(
        redis_key,
        settings.OTP_EXPIRY_MINUTES * 60,
        otp
    )

    # Send OTP via Email in background (non-blocking)
    background_tasks.add_task(
        send_otp_email_bg,
        request.email,
        otp
    )

    return {
        "message": "OTP sent successfully to email",
        "otp": otp if (settings.DEBUG or settings.ENABLE_DEMO_OTP) else None,
        "expires_in_minutes": settings.OTP_EXPIRY_MINUTES
    }


@router.post("/verify-email-otp", response_model=Token)
async def verify_email_otp(
    request: EmailOTPVerify,
    http_request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Verify email OTP and return tokens"""
    redis_client = await get_redis()
    redis_key = f"email_otp:{request.email}"

    # Get stored OTP
    stored_otp = await redis_client.get(redis_key)

    if not stored_otp or stored_otp != request.otp:
        raise UnauthorizedException("Invalid or expired OTP")

    # Get or create user
    user = await user_crud.get_by_email(db, request.email)
    if not user:
        # Currently, minimal user creation is purely by phone. We create a minimal email user or block
        # For full open source best practice, we can create a user based on email.
        # But wait, create_minimal_user takes phone. Let's make an ad-hoc logic or adjust.
        # Assuming we need to support creating a minimal email user or require signup for email users:
        raise UnauthorizedException("User with this email not found. Please sign up or login with Phone.")

    # Delete OTP from Redis
    await redis_client.delete(redis_key)
    
    # Update login stats in background (non-blocking)
    background_tasks.add_task(
        update_login_stats_bg,
        user.id
    )
    
    # Log successful OTP login
    await audit_logger.log_login_success(db, user, http_request, "email_otp")

    # Generate JTIs for session tracking
    access_jti = generate_jti()
    refresh_jti = generate_jti()

    # Create tokens
    access_token = create_access_token(
        data={"user_id": user.id, "role": user.role.value, "jti": access_jti}
    )
    refresh_token = create_refresh_token(
        data={"user_id": user.id, "jti": refresh_jti}
    )

    # Create session
    await session_manager.create_session(
        db=db,
        user_id=user.id,
        access_token_jti=access_jti,
        refresh_token_jti=refresh_jti,
        ip_address=http_request.client.host if http_request.client else None,
        user_agent=http_request.headers.get("user-agent"),
        login_method="email_otp",
        request=http_request
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        role=user.role
    )


# Helper function for portal type validation
def validate_portal_access(user_role: UserRole, portal_type: PortalType) -> tuple[bool, str]:
    """
    Validate if a user role is allowed to access a specific portal.
    
    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    # Citizen portal roles
    CITIZEN_PORTAL_ROLES = {
        UserRole.CITIZEN,
        UserRole.CONTRIBUTOR,
        UserRole.MODERATOR
    }
    
    # Officer portal roles
    OFFICER_PORTAL_ROLES = {
        UserRole.NODAL_OFFICER,
        UserRole.AUDITOR,
        UserRole.ADMIN,
        UserRole.SUPER_ADMIN
    }
    
    if portal_type == PortalType.CITIZEN:
        if user_role in CITIZEN_PORTAL_ROLES:
            return True, ""
        else:
            return False, (
                f"This account ({user_role.value}) is registered as a government official. "
                f"Please use the Officer Portal to login."
            )
    
    elif portal_type == PortalType.OFFICER:
        if user_role in OFFICER_PORTAL_ROLES:
            return True, ""
        else:
            return False, (
                f"This account ({user_role.value}) is registered as a citizen. "
                f"Please use the Citizen Portal to login."
            )
    
    return False, "Invalid portal type"


@router.post("/request-otp", status_code=status.HTTP_200_OK)
async def request_otp(
    request: OTPRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Request OTP for phone number with rate limiting"""
    # Check rate limit
    await rate_limiter.check_otp_rate_limit(request.phone)
    
    redis_client = await get_redis()

    # Generate OTP
    otp = generate_otp()
    redis_key = f"otp:{request.phone}"

    # Store OTP in Redis with expiry
    await redis_client.setex(
        redis_key,
        settings.OTP_EXPIRY_MINUTES * 60,
        otp
    )

    # Send OTP via SMS in background (non-blocking)
    background_tasks.add_task(
        send_otp_sms_bg,
        request.phone,
        otp
    )

    # Also send OTP via email if user has email on file (tests SMTP in dev)
    user = await user_crud.get_by_phone(db, request.phone)
    if user and user.email:
        background_tasks.add_task(
            send_otp_email_bg,
            user.email,
            otp
        )

    return {
        "message": "OTP sent successfully",
        "otp": otp if (settings.DEBUG or settings.ENABLE_DEMO_OTP) else None,
        "expires_in_minutes": settings.OTP_EXPIRY_MINUTES
    }


@router.post("/verify-otp", response_model=Token)
async def verify_otp(
    request: OTPVerify,
    http_request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Verify OTP and return access + refresh tokens with session tracking"""
    redis_client = await get_redis()
    redis_key = f"otp:{request.phone}"

    # Get stored OTP
    stored_otp = await redis_client.get(redis_key)

    if not stored_otp or stored_otp != request.otp:
        raise UnauthorizedException("Invalid or expired OTP")

    # Get or create user
    user = await user_crud.get_by_phone(db, request.phone)
    if not user:
        user = await user_crud.create_minimal_user(db, request.phone)

    # Delete OTP from Redis
    await redis_client.delete(redis_key)
    
    # Update login stats in background (non-blocking)
    background_tasks.add_task(
        update_login_stats_bg,
        user.id
    )
    
    # Log successful OTP login (keep synchronous for security audit trail)
    await audit_logger.log_login_success(db, user, http_request, "otp")

    # Generate JTIs for session tracking
    access_jti = generate_jti()
    refresh_jti = generate_jti()

    # Create tokens
    access_token = create_access_token(
        data={"user_id": user.id, "role": user.role.value, "jti": access_jti}
    )
    refresh_token = create_refresh_token(
        data={"user_id": user.id, "jti": refresh_jti}
    )

    # Create session
    await session_manager.create_session(
        db=db,
        user_id=user.id,
        access_token_jti=access_jti,
        refresh_token_jti=refresh_jti,
        ip_address=http_request.client.host if http_request.client else None,
        user_agent=http_request.headers.get("user-agent"),
        login_method="otp",
        request=http_request
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        role=user.role
    )


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def citizen_signup(
    request: CitizenSignupRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Full citizen registration with password"""
    # Check if phone already exists
    existing_user = await user_crud.get_by_phone(db, request.phone)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered. Please login instead."
        )
    
    # Check if email already exists (if provided)
    if request.email:
        existing_email = await user_crud.get_by_email(db, request.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create user with password (phone not verified yet)
    from app.schemas.user import UserCreate
    from app.models.user import UserRole, ProfileCompletionLevel
    
    # Handle name fields: construct full_name if not provided, or vice versa
    full_name = request.full_name
    first_name = request.first_name
    last_name = request.last_name
    
    if not full_name and (first_name or last_name):
        full_name = f"{first_name or ''} {last_name or ''}".strip()
    elif full_name and not (first_name and last_name):
        # Optional: split full_name into first/last if needed
        parts = full_name.split(maxsplit=1)
        if len(parts) > 0 and not first_name:
            first_name = parts[0]
        if len(parts) > 1 and not last_name:
            last_name = parts[1]

    user_data = UserCreate(
        phone=request.phone,
        first_name=first_name,
        last_name=last_name,
        full_name=full_name,
        email=request.email,
        password=request.password,
        role=UserRole.CITIZEN
    )
    
    user = await user_crud.create_with_password(db, user_data)
    
    # Generate OTP for phone verification
    redis_client = await get_redis()
    otp = generate_otp()
    redis_key = f"otp:{request.phone}"
    
    # Store OTP in Redis with expiry
    await redis_client.setex(
        redis_key,
        settings.OTP_EXPIRY_MINUTES * 60,
        otp
    )
    
    # Send OTP via SMS in background (non-blocking)
    background_tasks.add_task(send_otp_sms_bg, request.phone, otp)
    
    # Also send OTP via email if the user provided one (verifies SMTP works)
    if request.email:
        background_tasks.add_task(send_otp_email_bg, request.email, otp)
    
    return {
        "message": "Account created successfully. Please verify your phone number.",
        "user_id": user.id,
        "otp": otp if (settings.DEBUG or settings.ENABLE_DEMO_OTP) else None,
        "expires_in_minutes": settings.OTP_EXPIRY_MINUTES
    }


@router.post("/verify-phone", response_model=Token)
async def verify_phone_after_signup(
    request: PhoneVerifyRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Verify phone number after signup and return tokens"""
    redis_client = await get_redis()
    redis_key = f"otp:{request.phone}"
    
    # Get stored OTP
    stored_otp = await redis_client.get(redis_key)
    
    if not stored_otp or stored_otp != request.otp:
        raise UnauthorizedException("Invalid or expired OTP")
    
    # Get user by phone
    user = await user_crud.get_by_phone(db, request.phone)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please sign up first."
        )
    
    # Mark phone as verified
    user.phone_verified = True
    await db.commit()
    await db.refresh(user)
    
    # Update login stats
    await user_crud.update_login_stats(db, user.id)
    
    # Delete OTP from Redis
    await redis_client.delete(redis_key)
    
    # Log successful verification
    await audit_logger.log_login_success(db, user, http_request, "signup_verification")
    
    # Generate JTIs for session tracking
    access_jti = generate_jti()
    refresh_jti = generate_jti()
    
    # Create tokens
    access_token = create_access_token(
        data={"user_id": user.id, "role": user.role.value, "jti": access_jti}
    )
    refresh_token = create_refresh_token(
        data={"user_id": user.id, "jti": refresh_jti}
    )
    
    # Create session
    await session_manager.create_session(
        db=db,
        user_id=user.id,
        access_token_jti=access_jti,
        refresh_token_jti=refresh_jti,
        ip_address=http_request.client.host if http_request.client else None,
        user_agent=http_request.headers.get("user-agent"),
        login_method="signup_verification",
        request=http_request
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        role=user.role
    )


@router.post("/login", response_model=Token)
async def login(
    request: LoginRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Login with phone and password with rate limiting and account lockout"""
    # Check rate limit
    await rate_limiter.check_login_rate_limit(request.phone)
    
    # Check if account is locked
    await account_security.check_account_status(request.phone)
    
    # Authenticate user
    user = await user_crud.authenticate(db, request.phone, request.password)

    if not user:
        # Record failed login attempt
        attempts = await account_security.record_failed_login(request.phone)
        remaining = settings.MAX_LOGIN_ATTEMPTS - attempts
        
        # Log failed login
        await audit_logger.log_login_failure(
            db, request.phone, http_request,
            reason="Invalid credentials"
        )
        
        if remaining > 0:
            raise UnauthorizedException(
                f"Incorrect phone or password. {remaining} attempts remaining."
            )
        else:
            raise UnauthorizedException(
                f"Account locked due to too many failed attempts. "
                f"Try again in {settings.ACCOUNT_LOCKOUT_DURATION_MINUTES} minutes."
            )

    # Validate portal access based on user role
    is_valid, error_message = validate_portal_access(user.role, request.portal_type)
    if not is_valid:
        # Log portal access violation
        await audit_logger.log_action(
            db=db,
            user_id=user.id,
            action=AuditAction.LOGIN_FAILED,
            status=AuditStatus.FAILURE,
            details={
                "reason": "Portal access denied",
                "user_role": user.role.value,
                "attempted_portal": request.portal_type.value,
                "ip_address": http_request.client.host if http_request.client else None
            },
            ip_address=http_request.client.host if http_request.client else None,
            user_agent=http_request.headers.get("user-agent")
        )
        raise UnauthorizedException(error_message)
    
    # Clear failed login attempts on successful login
    await account_security.clear_failed_login(request.phone)

    # Update login stats
    await user_crud.update_login_stats(db, user.id)
    
    # Log successful login
    await audit_logger.log_login_success(db, user, http_request, "password")

    # Generate JTIs
    access_jti = generate_jti()
    refresh_jti = generate_jti()

    # Create tokens
    access_token = create_access_token(
        data={"user_id": user.id, "role": user.role.value, "jti": access_jti}
    )
    refresh_token = create_refresh_token(
        data={"user_id": user.id, "jti": refresh_jti}
    )

    # Create session
    await session_manager.create_session(
        db=db,
        user_id=user.id,
        access_token_jti=access_jti,
        refresh_token_jti=refresh_jti,
        ip_address=http_request.client.host if http_request.client else None,
        user_agent=http_request.headers.get("user-agent"),
        login_method="password",
        request=http_request
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        role=user.role
    )


@router.post("/create-officer", status_code=status.HTTP_201_CREATED)
async def create_officer(
    officer_data: OfficerCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Create officer/admin account (admin only)"""

    # Check if phone or email already exists
    existing_phone = await user_crud.get_by_phone(db, officer_data.phone)
    if existing_phone:
        raise ValidationException("Phone number already registered")

    existing_email = await user_crud.get_by_email(db, officer_data.email)
    if existing_email:
        raise ValidationException("Email already registered")

    # Handle name fields
    if not officer_data.full_name and (officer_data.first_name or officer_data.last_name):
        officer_data.full_name = f"{officer_data.first_name or ''} {officer_data.last_name or ''}".strip()
    elif officer_data.full_name and not (officer_data.first_name and officer_data.last_name):
        parts = officer_data.full_name.split(maxsplit=1)
        if len(parts) > 0 and not officer_data.first_name:
            officer_data.first_name = parts[0]
        if len(parts) > 1 and not officer_data.last_name:
            officer_data.last_name = parts[1]

    # Create officer
    officer = await user_crud.create_officer(db, officer_data)

    return {
        "message": "Officer account created successfully",
        "user_id": officer.id,
        "role": officer.role.value,
        "profile_completion": officer.profile_completion.value
    }


@router.post("/complete-profile")
async def complete_profile(
    profile_data: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Complete user profile progressively"""
    updated_user = await user_crud.update_profile(db, current_user.id, profile_data)

    return {
        "message": "Profile updated successfully",
        "profile_completion": updated_user.profile_completion.value,
        "can_promote_to_contributor": updated_user.should_promote_to_contributor()
    }


@router.post("/verify-password")
async def verify_user_password(
    request: dict,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Verify current user's password for sensitive operations"""
    password = request.get("password")
    
    if not password:
        raise ValidationException("Password is required")
    
    # Get fresh user data with password hash
    user = await user_crud.get(db, current_user.id)
    if not user:
        raise UnauthorizedException("User not found")
    
    # Verify password (Note: User model uses hashed_password, not password_hash)
    if not user.hashed_password or not verify_password(password, user.hashed_password):
        raise UnauthorizedException("Invalid password")
    
    return {"verified": True, "message": "Password verified successfully"}
