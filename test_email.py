import os
from dotenv import load_dotenv
load_dotenv(dotenv_path="d:/AdharCoffe/AdharCoffe/.env")
print("Email:", os.environ.get("SMTP_EMAIL"))
print("Pass: ", os.environ.get("SMTP_PASSWORD"))
import smtplib
try:
    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    password = os.environ.get("SMTP_PASSWORD")
    if password: password = password.replace(" ", "")
    server.login(os.environ.get("SMTP_EMAIL"), password)
    print("Login successful")
    server.quit()
except Exception as e:
    print(f"Error: {e}")
