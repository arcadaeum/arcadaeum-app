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
        print("ERROR: Email credentials not configured")
        print(f"  SENDER_EMAIL: {sender_email}")
        print(f"  SENDER_PASSWORD: {'*' * len(sender_password) if sender_password else 'None'}")
        return False

    print(f"DEBUG: Attempting to send password reset email to {recipient_email}")

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
        print(f"DEBUG: Connecting to {smtp_server}:{smtp_port}...")
        async with aiosmtplib.SMTP(hostname=smtp_server, port=smtp_port, start_tls=True) as smtp:
            print("DEBUG: Connected to SMTP server")
            print("DEBUG: Logging in...")
            await smtp.login(sender_email, sender_password)
            print("DEBUG: Login successful")
            print("DEBUG: Sending email...")
            await smtp.sendmail(sender_email, recipient_email, message.as_string())
            print(f"SUCCESS: Password reset email sent to {recipient_email}")
        return True
    except Exception as e:
        print(f"ERROR sending email: {type(e).__name__}: {e}")
        import traceback

        traceback.print_exc()
        return False
