import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib


async def send_password_reset_email(
    recipient_email: str, reset_token: str, frontend_url: str
) -> bool:
    """Send a password reset email with a reset link."""

    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")

    if not sender_email or not sender_password:
        print("Warning: Email credentials not configured")
        return False

    reset_link = f"{frontend_url}/reset-password?token={reset_token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = "Arcadaeum - Password Reset Request"
    message["From"] = sender_email
    message["To"] = recipient_email

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

    message.attach(MIMEText(html, "html"))

    try:
        async with aiosmtplib.SMTP(hostname=smtp_server, port=smtp_port) as smtp:
            await smtp.connect()
            if smtp_port == 587:
                await smtp.starttls()
            await smtp.login(sender_email, sender_password)
            await smtp.sendmail(sender_email, recipient_email, message.as_string())
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
