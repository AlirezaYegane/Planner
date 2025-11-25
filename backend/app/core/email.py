"""
Email service for sending verification and password reset emails.
Supports both SendGrid and SMTP providers.
"""

from typing import Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    from_email: Optional[str] = None,
    from_name: Optional[str] = None
) -> bool:
    """
    Send an email using configured provider (SendGrid or SMTP).
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML email body
        from_email: Sender email (defaults to config)
        from_name: Sender name (defaults to config)
        
    Returns:
        True if sent successfully, False otherwise
    """
    from_email = from_email or settings.EMAIL_FROM
    from_name = from_name or settings.EMAIL_FROM_NAME
    
    try:
        if settings.EMAIL_PROVIDER == "sendgrid":
            return await _send_with_sendgrid(to_email, subject, html_content, from_email, from_name)
        elif settings.EMAIL_PROVIDER == "smtp":
            return await _send_with_smtp(to_email, subject, html_content, from_email, from_name)
        else:
            logger.error(f"Unknown email provider: {settings.EMAIL_PROVIDER}")
            return False
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


async def _send_with_sendgrid(
    to_email: str,
    subject: str,
    html_content: str,
    from_email: str,
    from_name: str
) -> bool:
    """Send email using SendGrid API."""
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Email, To, Content
        
        if not settings.SENDGRID_API_KEY:
            logger.warning("SendGrid API key not configured, email not sent")
            return False
        
        message = Mail(
            from_email=Email(from_email, from_name),
            to_emails=To(to_email),
            subject=subject,
            html_content=Content("text/html", html_content)
        )
        
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        
        if response.status_code in [200, 201, 202]:
            logger.info(f"Email sent successfully to {to_email}")
            return True
        else:
            logger.error(f"SendGrid returned status {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"SendGrid error: {str(e)}")
        return False


async def _send_with_smtp(
    to_email: str,
    subject: str,
    html_content: str,
    from_email: str,
    from_name: str
) -> bool:
    """Send email using SMTP."""
    try:
        import aiosmtplib
        from email.message import EmailMessage
        
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning("SMTP credentials not configured, email not sent")
            return False
        
        message = EmailMessage()
        message["From"] = f"{from_name} <{from_email}>"
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content("Please view this email in an HTML-capable email client.")
        message.add_alternative(html_content, subtype="html")
        
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        
        logger.info(f"Email sent successfully to {to_email} via SMTP")
        return True
        
    except Exception as e:
        logger.error(f"SMTP error: {str(e)}")
        return False


def get_verification_email_html(verification_link: str, user_name: Optional[str] = None) -> str:
    """
    Generate HTML for email verification email.
    
    Args:
        verification_link: Full URL to verification endpoint with token
        user_name: User's name (optional)
        
    Returns:
        HTML email content
    """
    greeting = f"Hi {user_name}," if user_name else "Hi there,"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F9FC;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F9FC; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #246BFD 0%, #1E4DD8 100%); padding: 40px 40px 30px 40px; text-align: center;">
                                <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 700;">Verify Your Email</h1>
                            </td>
                        </tr>
                        
                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px;">
                                <p style="color: #1A202C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">{greeting}</p>
                                
                                <p style="color: #4A5568; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                                    Thank you for signing up for <strong>Deep Focus Planner</strong>! To complete your registration and start planning your success, please verify your email address by clicking the button below.
                                </p>
                                
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="padding: 20px 0;">
                                            <a href="{verification_link}" style="display: inline-block; background: linear-gradient(135deg, #246BFD 0%, #1E4DD8 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(36, 107, 253, 0.3);">
                                                Verify Email Address
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                    If the button doesn't work, copy and paste this link into your browser:
                                </p>
                                <p style="color: #246BFD; font-size: 13px; word-break: break-all; margin: 10px 0 0 0;">
                                    {verification_link}
                                </p>
                                
                                <p style="color: #A0AEC0; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #E2E8F0;">
                                    This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #F7F9FC; padding: 30px 40px; text-align: center;">
                                <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
                                    © 2025 Deep Focus Planner. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def get_password_reset_email_html(reset_link: str, user_name: Optional[str] = None) -> str:
    """
    Generate HTML for password reset email.
    
    Args:
        reset_link: Full URL to password reset page with token
        user_name: User's name (optional)
        
    Returns:
        HTML email content
    """
    greeting = f"Hi {user_name}," if user_name else "Hi there,"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F9FC;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F9FC; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #246BFD 0%, #1E4DD8 100%); padding: 40px 40px 30px 40px; text-align: center;">
                                <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 700;">Reset Your Password</h1>
                            </td>
                        </tr>
                        
                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px;">
                                <p style="color: #1A202C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">{greeting}</p>
                                
                                <p style="color: #4A5568; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                                    We received a request to reset your password for your <strong>Deep Focus Planner</strong> account. Click the button below to create a new password.
                                </p>
                                
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="padding: 20px 0;">
                                            <a href="{reset_link}" style="display: inline-block; background: linear-gradient(135deg, #246BFD 0%, #1E4DD8 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(36, 107, 253, 0.3);">
                                                Reset Password
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                    If the button doesn't work, copy and paste this link into your browser:
                                </p>
                                <p style="color: #246BFD; font-size: 13px; word-break: break-all; margin: 10px 0 0 0;">
                                    {reset_link}
                                </p>
                                
                                <p style="color: #A0AEC0; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #E2E8F0;">
                                    This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #F7F9FC; padding: 30px 40px; text-align: center;">
                                <p style="color: #A0AEC0; font-size: 12px; margin: 0;">
                                    © 2025 Deep Focus Planner. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


async def send_verification_email(to_email: str, verification_token: str, user_name: Optional[str] = None) -> bool:
    """
    Send email verification email to user.
    
    Args:
        to_email: User's email address
        verification_token: Verification token
        user_name: User's name (optional)
        
    Returns:
        True if sent successfully
    """
    verification_link = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    html_content = get_verification_email_html(verification_link, user_name)
    
    return await send_email(
        to_email=to_email,
        subject="Verify Your Email - Deep Focus Planner",
        html_content=html_content
    )


async def send_password_reset_email(to_email: str, reset_token: str, user_name: Optional[str] = None) -> bool:
    """
    Send password reset email to user.
    
    Args:
        to_email: User's email address
        reset_token: Password reset token
        user_name: User's name (optional)
        
    Returns:
        True if sent successfully
    """
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    html_content = get_password_reset_email_html(reset_link, user_name)
    
    return await send_email(
        to_email=to_email,
        subject="Reset Your Password - Deep Focus Planner",
        html_content=html_content
    )
