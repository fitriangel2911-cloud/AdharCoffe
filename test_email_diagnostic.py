import os
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

def test_email_diagnostic():
    load_dotenv()
    sender_email = os.environ.get("SMTP_EMAIL")
    sender_password = os.environ.get("SMTP_PASSWORD")
    
    print(f"--- DIAGNOSTIC START ---")
    print(f"SMTP_EMAIL: {sender_email}")
    print(f"SMTP_PASSWORD: {'*' * len(sender_password) if sender_password else 'MISSING'}")
    
    if not sender_email or not sender_password:
        print("ERROR: Missing credentials in .env file.")
        return

    recipient = sender_email # Test by sending to self
    msg = MIMEText("This is a diagnostic test from Adhar Coffe SmartPOS.")
    msg["Subject"] = "SmartPOS Email Test"
    msg["From"] = sender_email
    msg["To"] = recipient

    try:
        print("Connecting to smtp.gmail.com (SSL:465)...")
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        print("Logging in...")
        server.login(sender_email, sender_password)
        print("Sending test email...")
        server.sendmail(sender_email, recipient, msg.as_string())
        server.quit()
        print("SUCCESS! Email sent successfully.")
    except smtplib.SMTPAuthenticationError:
        print("FAILED: Authentication Error. Check if 'App Password' is correct and 2FA is enabled.")
    except Exception as e:
        print(f"FAILED: An unexpected error occurred: {e}")

if __name__ == "__main__":
    test_email_diagnostic()
