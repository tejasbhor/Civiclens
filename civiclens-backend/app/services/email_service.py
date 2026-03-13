import logging
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)

# Template folder configuration
template_folder = Path(__file__).parent.parent / "templates" / "email"

# Production ready email configuration
# Fallbacks are provided, but in production these should be explicitly configured in .env
email_conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USERNAME or "",
    MAIL_PASSWORD=settings.SMTP_PASSWORD or "",
    MAIL_FROM=settings.SMTP_FROM or f"noreply@{settings.ORG_SHORT_NAME.lower()}.local",
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST or "localhost",
    MAIL_FROM_NAME=settings.APP_NAME,
    MAIL_STARTTLS=settings.SMTP_USE_TLS,
    MAIL_SSL_TLS=not settings.SMTP_USE_TLS, # Use STARTTLS or SSL_TLS depending on config
    USE_CREDENTIALS=bool(settings.SMTP_USERNAME),
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=template_folder
)

fast_mail = FastMail(email_conf)

async def send_otp_email(email: EmailStr, otp: str):
    """
    Production-ready asynchronous OTP email sender.
    Uses HTML templates and background task integration.
    """
    try:
        # SMTP configuration check
        if not settings.SMTP_HOST:
            logger.warning(f"Email Warning: SMTP_HOST not configured. Email to {email} will fail.")

        message = MessageSchema(
            subject=f"[{settings.APP_NAME} - {settings.ORG_NAME}] Your Authentication Code",
            recipients=[email],
            template_body={
                "otp": otp,
                "app_name": f"{settings.APP_NAME} - {settings.ORG_NAME}",
                "support_email": settings.ORG_SUPPORT_EMAIL or settings.SMTP_FROM or "",
                "org_name": settings.ORG_NAME,
            },
            subtype=MessageType.html
        )
        
        await fast_mail.send_message(message, template_name="otp.html")
        logger.info(f"Email: OTP sent successfully to {email}")
    except Exception as e:
        logger.error(f"Email Error: Failed to send OTP to {email}: {str(e)}")

async def send_notification_email(to_email: str, subject: str, body: str):
    """
    Send general notification email
    """
    try:
        if not settings.SMTP_HOST:
            logger.warning(f"Email Warning: SMTP_HOST not configured for notification to {to_email}")
            
        message = MessageSchema(
            subject=subject,
            recipients=[to_email],
            body=body,
            subtype=MessageType.plain
        )
        
        await fast_mail.send_message(message)
        logger.info(f"Email: Notification sent successfully to {to_email}")
    except Exception as e:
        logger.error(f"Email Error: Failed to send notification to {to_email}: {str(e)}")
