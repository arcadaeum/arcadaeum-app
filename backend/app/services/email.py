import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


async def send_password_reset_email(
    recipient_email: str, reset_token: str, frontend_url: str
) -> bool:
    """Send a password reset email with a reset link."""

    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SENDER_EMAIL = os.getenv("SENDER_EMAIL")
    SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("Warning: Email credentials not configured")
        return False

    # Build reset link
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"

    # Create email message
    message = MIMEMultipart("alternative")
    message["Subject"] = "Arcadaeum - Password Reset Request"
    message["From"] = SENDER_EMAIL
    message["To"] = recipient_email

    # HTML content
    html = f"""\
    <html>
      <body>
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <p>
          <a href="{reset_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>Or paste this link in your browser:</p>
        <p>{reset_link}</p>
        <p><strong>This link expires in 1 hour.</strong></p>
        <hr>
      </body>
    </html>
    """

    part = MIMEText(html, "html")
    message.attach(part)

    try:
        async with aiosmtplib.SMTP(hostname=SMTP_SERVER, port=SMTP_PORT) as smtp:
            await smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
            await smtp.sendmail(SENDER_EMAIL, recipient_email, message.as_string())
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
