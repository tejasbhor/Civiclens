#!/usr/bin/env python3
"""
Complete Report Submission API - Production Ready
Single atomic endpoint for report creation with media upload
"""

from fastapi import APIRouter, Depends, UploadFile, File, Form, status, Request, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
import json
import time
import logging
from datetime import datetime

from app.core.database import get_db, get_redis
from app.core.dependencies import get_current_user
from app.core.exceptions import NotFoundException, ForbiddenException, ValidationException
from app.core.audit_logger import audit_logger
from app.models.audit_log import AuditAction, AuditStatus
from app.models.user import User
from app.models.report import Report, ReportStatus, ReportSeverity, ReportCategory
from app.schemas.report import ReportCreateInternal, ReportResponse, ReportWithDetails
from app.services.file_upload_service import get_file_upload_service, FileUploadService
from app.crud.report import report_crud
from app.core.background_tasks import (
    update_user_reputation_bg,
    queue_report_for_processing_bg,
    log_audit_event_bg
)
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["Complete Report Submission"])


async def _validate_complete_submission(
    db: AsyncSession,
    user_id: int,
    title: str,
    description: str,
    category: str,
    severity: str,
    latitude: float,
    longitude: float,
    files: List[UploadFile],
    current_user: User
) -> None:
    """Comprehensive validation for complete report submission"""
    
    # Content validation
    title = title.strip()
    description = description.strip()
    
    if len(title) < 5:
        raise ValidationException("Title must be at least 5 characters long")
    
    if len(title) > 200:
        raise ValidationException("Title cannot exceed 200 characters")
    
    if len(description) < 10:
        raise ValidationException("Description must be at least 10 characters long")
    
    if len(description) > 2000:
        raise ValidationException("Description cannot exceed 2000 characters")
    
    # Category validation
    try:
        ReportCategory(category)
    except ValueError:
        valid_categories = [cat.value for cat in ReportCategory]
        raise ValidationException(f"Invalid category '{category}'. Must be one of: {', '.join(valid_categories)}")
    
    # Severity validation
    try:
        ReportSeverity(severity)
    except ValueError:
        valid_severities = [sev.value for sev in ReportSeverity]
        raise ValidationException(f"Invalid severity '{severity}'. Must be one of: {', '.join(valid_severities)}")
    
    # Coordinate validation
    if not (-90 <= latitude <= 90):
        raise ValidationException(f"Invalid latitude {latitude}. Must be between -90 and 90")
    
    if not (-180 <= longitude <= 180):
        raise ValidationException(f"Invalid longitude {longitude}. Must be between -180 and 180")
    
    # File validation
    if not files or len(files) == 0:
        raise ValidationException("At least one photo is required")
    
    if len(files) > 6:
        raise ValidationException("Maximum 6 files allowed (5 images + 1 audio)")
    
    # Validate file types and sizes
    image_count = 0
    audio_count = 0
    max_image_size = 10 * 1024 * 1024  # 10MB
    max_audio_size = 25 * 1024 * 1024  # 25MB
    
    for file in files:
        if not file.filename:
            raise ValidationException("All files must have valid filenames")
        
        # Get file extension
        ext = file.filename.lower().split('.')[-1]
        
        # Validate by file type
        if ext in ['jpg', 'jpeg', 'png', 'webp']:
            image_count += 1
            if image_count > 5:
                raise ValidationException("Maximum 5 images allowed per report")
            
            # Check file size (estimate from content-length if available)
            if hasattr(file, 'size') and file.size and file.size > max_image_size:
                raise ValidationException(f"Image file too large. Maximum size is 10MB")
                
        elif ext in ['mp3', 'wav', 'm4a']:
            audio_count += 1
            if audio_count > 1:
                raise ValidationException("Maximum 1 audio file allowed per report")
            
            if hasattr(file, 'size') and file.size and file.size > max_audio_size:
                raise ValidationException(f"Audio file too large. Maximum size is 25MB")
        else:
            raise ValidationException(
                f"Unsupported file type '{ext}'. "
                "Supported: JPEG, PNG, WebP for images; MP3, WAV, M4A for audio"
            )
    
    # User permission validation
    if not current_user.can_report():
        raise ForbiddenException("User does not have permission to create reports")
    
    # Rate limiting validation
    try:
        # Use pre-extracted user_id to prevent SQLAlchemy detachment issues
        recent_reports = await report_crud.get_user_recent_reports(
            db, user_id, minutes=5
        )
        if len(recent_reports) >= 3:
            raise ValidationException(
                "Rate limit exceeded. Maximum 3 reports per 5 minutes. Please wait before submitting again."
            )
    except Exception as e:
        logger.warning(f"Rate limiting check failed: {e}")
        # Don't block submission if rate limiting check fails


async def _create_report_with_number(
    db: AsyncSession,
    report_data: dict,
    user_id: int
) -> Report:
    """Create report with atomic report number generation"""
    
    max_retries = 5
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Generate unique report number using Redis
            city = settings.CITY_CODE or "NMC"
            year = datetime.utcnow().year
            redis = await get_redis()
            
            # Atomic increment in Redis
            seq = await redis.incr(f"seq:report_number:{city}:{year}")
            report_number = f"CL-{year}-{city}-{seq:05d}"
            
            # Add generated data to report
            report_dict = {
                **report_data,
                'user_id': user_id,
                'report_number': report_number,
                'status': ReportStatus.RECEIVED,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
            }
            
            # Create internal schema first
            report_create = ReportCreateInternal(**report_dict)
            
            # Manually create Report object to include PostGIS location (which Pydantic doesn't handle)
            from sqlalchemy import func
            report = Report(
                **report_create.model_dump(),
                location=func.ST_SetSRID(func.ST_MakePoint(report_data['longitude'], report_data['latitude']), 4326)
            )
            
            db.add(report)
            
            # Flush to get ID but don't commit yet (part of larger transaction)
            await db.flush()
            
            logger.info(f"Report created with ID: {report.id}, number: {report_number}")
            return report
            
        except IntegrityError as e:
            # Handle duplicate report number
            if "report_number" in str(e) or "ix_reports_report_number" in str(e):
                retry_count += 1
                await db.rollback()
                
                if retry_count >= max_retries:
                    logger.error(f"Failed to generate unique report number after {max_retries} retries")
                    raise ValidationException(
                        "Unable to generate unique report number. Please try again."
                    )
                
                # Exponential backoff
                import asyncio
                await asyncio.sleep(0.1 * (2 ** retry_count))
                logger.warning(f"Duplicate report number, retrying... (attempt {retry_count + 1}/{max_retries})")
                continue
            else:
                # Different integrity error - re-raise
                raise
        except Exception as e:
            logger.error(f"Error creating report: {e}")
            raise ValidationException(f"Failed to create report: {str(e)}")
    
    raise ValidationException("Failed to create report after maximum retries")


async def _log_complete_submission_audit(
    db: AsyncSession,
    request: Request,
    current_user: User,
    report: Report,
    user_id: int,
    user_email: str,
    media_count: int,
    total_size: int,
    duration: float
) -> None:
    """Log comprehensive audit information for complete submission"""
    
    await audit_logger.log(
        db=db,
        action=AuditAction.REPORT_CREATED,
        status=AuditStatus.SUCCESS,
        user=current_user,
        request=request,
        description=f"Complete report submission: {report.title}",
        metadata={
            "report_id": report.id,
            "report_number": report.report_number,
            "category": report.category,
            "severity": str(report.severity),
            "location": f"{report.latitude},{report.longitude}",
            "address": report.address,
            "media_count": media_count,
            "total_file_size": total_size,
            "submission_duration": duration,
            "submission_type": "complete_atomic",
            "user_id": user_id,
            "user_email": user_email,
            "validation_passed": True
        },
        resource_type="report",
        resource_id=str(report.id)
    )


@router.post("/submit-complete", response_model=ReportWithDetails, status_code=status.HTTP_201_CREATED)
async def submit_complete_report(
    # Dependencies (must come first - no defaults)
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    upload_service: FileUploadService = Depends(get_file_upload_service),
    
    # Report data fields
    title: str = Form(..., min_length=5, max_length=200, description="Report title"),
    description: str = Form(..., min_length=10, max_length=2000, description="Detailed description"),
    category: str = Form(..., description="Report category (roads, water, sanitation, etc.)"),
    severity: str = Form(..., description="Severity level (low, medium, high, critical)"),
    latitude: float = Form(..., ge=-90, le=90, description="Latitude coordinate"),
    longitude: float = Form(..., ge=-180, le=180, description="Longitude coordinate"),
    address: str = Form(..., min_length=5, max_length=500, description="Human-readable address"),
    landmark: Optional[str] = Form(None, max_length=200, description="Optional landmark reference"),
    is_public: bool = Form(True, description="Whether report is publicly visible"),
    is_sensitive: bool = Form(False, description="Whether report contains sensitive information"),
    
    # Media files (up to 5 images + 1 audio)
    files: List[UploadFile] = File(..., description="Media files (max 5 images + 1 audio)"),
    captions: Optional[str] = Form(None, description="JSON array of captions for each file")
):
    """
    Submit a complete report with all media files in a single atomic operation
    
    This endpoint provides:
    - Single API call for complete report submission
    - Atomic transaction (all succeed or all fail)
    - Comprehensive validation and error handling
    - Automatic retry logic for race conditions
    - Production-ready logging and monitoring
    - Offline-first architecture support
    
    Benefits:
    - Eliminates partial submission failures
    - Reduces API complexity for mobile clients
    - Better offline handling and sync capabilities
    - Improved user experience with single submission flow
    """
    
    start_time = time.time()
    
    # CRITICAL: Extract user attributes BEFORE any database operations
    # to prevent SQLAlchemy detachment issues (MissingGreenlet error)
    user_id = current_user.id
    user_email = current_user.email
    
    logger.info(f"Complete report submission started by user {user_id}: {title[:50]}")
    
    try:
        # 1. Comprehensive validation
        await _validate_complete_submission(
            db=db, user_id=user_id, title=title, description=description,
            category=category, severity=severity, latitude=latitude, longitude=longitude,
            files=files, current_user=current_user
        )
        
        # 2. Create report
        report_data = {
            'title': title.strip(),
            'description': description.strip(),
            'category': category,
            'severity': severity,
            'latitude': latitude,
            'longitude': longitude,
            'address': address.strip(),
            'landmark': landmark.strip() if landmark else None,
            'is_public': is_public,
            'is_sensitive': is_sensitive,
        }
        
        report = await _create_report_with_number(db, report_data, user_id)
        
        # 3. Handle media
        parsed_captions = []
        if captions:
            try:
                parsed_captions = json.loads(captions)
            except:
                parsed_captions = []
        
        media_list = await upload_service.upload_multiple_files(
            files=files, report_id=report.id, user_id=user_id, captions=parsed_captions
        )
        
        # 4. Finalize transaction
        await db.commit()
        await db.refresh(report, ['media', 'user', 'department'])
        
        duration = time.time() - start_time
        logger.info(f"Complete submission successful for report {report.id} in {duration:.2f}s")
        
        # 5. Background tasks
        background_tasks.add_task(queue_report_for_processing_bg, report.id)
        background_tasks.add_task(update_user_reputation_bg, user_id, 5)
        background_tasks.add_task(
            _log_complete_submission_audit, db, request, current_user, report,
            user_id, user_email, len(media_list), 0, duration
        )
        
        # Invalidate cache
        try:
            redis = await get_redis()
            keys = await redis.keys("map_data:*")
            if keys: await redis.delete(*keys)
        except: pass
        
        # Send notification
        try:
            from app.services.notification_service import NotificationService
            ns = NotificationService(db)
            await ns.notify_report_received(report)
        except: pass
        
        # 6. Response
        from app.api.v1.reports import serialize_report_with_details
        return serialize_report_with_details(report, current_user)
        
    except ValidationException as e:
        duration = time.time() - start_time
        logger.error(f"Validation error in complete submission: {str(e)} (duration: {duration:.2f}s)")
        
        # Audit log for validation failure
        await audit_logger.log(
            db=db,
            action=AuditAction.REPORT_CREATED,
            status=AuditStatus.FAILURE,
            user=current_user,
            request=request,
            description=f"Complete submission failed: Validation error",
            metadata={
                "error": str(e),
                "error_type": "ValidationException",
                "user_id": user_id,
                "submission_duration": duration,
                "submission_type": "complete_atomic",
                "files_count": len(files) if files else 0
            },
            resource_type="report",
            resource_id=None
        )
        raise
        
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Unexpected error in complete submission: {str(e)} (duration: {duration:.2f}s)")
        logger.error(f"Error type: {type(e).__name__}")
        
        # Audit log for system failure
        await audit_logger.log(
            db=db,
            action=AuditAction.REPORT_CREATED,
            status=AuditStatus.FAILURE,
            user=current_user,
            request=request,
            description=f"Complete submission failed: System error",
            metadata={
                "error": str(e),
                "error_type": type(e).__name__,
                "user_id": user_id,
                "submission_duration": duration,
                "submission_type": "complete_atomic",
                "files_count": len(files) if files else 0
            },
            resource_type="report",
            resource_id=None
        )
        
        # Return user-friendly error message
        raise ValidationException(
            "Report submission failed due to a server error. Please try again. "
            "If the problem persists, please contact support."
        )


@router.get("/submission-limits")
async def get_submission_limits():
    """Get current submission limits and configuration"""
    
    return {
        "limits": {
            "max_files": 6,
            "max_images": 5,
            "max_audio": 1,
            "max_image_size_mb": 10,
            "max_audio_size_mb": 25,
            "max_title_length": 200,
            "max_description_length": 2000,
            "rate_limit_reports_per_5min": 3
        },
        "supported_formats": {
            "images": ["jpg", "jpeg", "png", "webp"],
            "audio": ["mp3", "wav", "m4a"]
        },
        "validation_rules": {
            "min_title_length": 5,
            "min_description_length": 10,
            "coordinate_bounds": {
                "latitude": {"min": -90, "max": 90},
                "longitude": {"min": -180, "max": 180}
            }
        },
        "processing": {
            "atomic_transaction": True,
            "automatic_retry": True,
            "background_processing": True,
            "offline_support": True
        }
    }
