from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv
import random

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv

import os
import secrets
import smtplib

from datetime import datetime, timedelta
from email.message import EmailMessage

from database import get_db
from models import User, ResumeAnalysis

load_dotenv()
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

if not GOOGLE_CLIENT_ID:
    print("WARNING: GOOGLE_CLIENT_ID is not configured.")


router = APIRouter()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


# ============================================================
# USER RESPONSE
# ============================================================

def user_response(db_user: User):
    return {
        "id": db_user.id,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "email": db_user.email,
        "phone": db_user.phone or "",
        "country_code": db_user.country_code or "+91",
        "role": db_user.role or "student",
        "other_role": db_user.other_role or "",
        "experience": db_user.experience or "0",
    }

# ============================================================
# PASSWORD RESET EMAIL
# ============================================================

def send_reset_otp(email: str, otp: str):
    if not SMTP_EMAIL:
        raise RuntimeError("SMTP_EMAIL is not configured.")

    if not SMTP_PASSWORD:
        raise RuntimeError("SMTP_PASSWORD is not configured.")

    message = MIMEMultipart("alternative")

    message["Subject"] = "ResumeLens Password Reset OTP"
    message["From"] = SMTP_EMAIL
    message["To"] = email

    text = f"""
ResumeLens Password Reset

Your password reset OTP is:

{otp}

This OTP is valid for a limited time.

If you did not request a password reset, you can safely ignore this email.

ResumeLens
"""

    html = f"""
<html>
<body style="font-family: Arial, sans-serif;">
    <h2>ResumeLens Password Reset</h2>

    <p>Your password reset OTP is:</p>

    <h1 style="letter-spacing: 6px;">{otp}</h1>

    <p>
        This OTP is valid for a limited time.
    </p>

    <p>
        If you did not request a password reset,
        you can safely ignore this email.
    </p>

    <p>ResumeLens</p>
</body>
</html>
"""

    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(
            SMTP_HOST,
            SMTP_PORT,
            timeout=20,
        ) as server:

            server.ehlo()
            server.starttls()
            server.ehlo()

            server.login(
                SMTP_EMAIL,
                SMTP_PASSWORD,
            )

            server.sendmail(
                SMTP_EMAIL,
                email,
                message.as_string(),
            )

    except smtplib.SMTPAuthenticationError:
        raise RuntimeError(
            "Gmail authentication failed. "
            "Check SMTP_EMAIL and use a Google App Password."
        )

    except smtplib.SMTPException as error:
        print("SMTP error:", error)

        raise RuntimeError(
            "Unable to send password reset email."
        )
# ============================================================
# SIGNUP
# ============================================================

@router.post("/signup")
def signup(
    user: dict,
    db: Session = Depends(get_db),
):

    email = user["email"].strip().lower()
    phone = user["phone"].strip()
    country_code = user.get("country_code", "+91")

    # --------------------------------------------------------
    # Validate Gmail
    # --------------------------------------------------------

    if not email.endswith("@gmail.com"):
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid Gmail address.",
        )

    # --------------------------------------------------------
    # Validate phone
    # --------------------------------------------------------

    if not phone.isdigit() or len(phone) != 10:
        raise HTTPException(
            status_code=400,
            detail="Phone number must contain exactly 10 digits.",
        )

    # --------------------------------------------------------
    # Check email
    # --------------------------------------------------------

    existing_email = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # --------------------------------------------------------
    # Check phone
    # --------------------------------------------------------

    existing_phone = (
        db.query(User)
        .filter(
            User.phone == phone,
            User.country_code == country_code,
        )
        .first()
    )

    if existing_email and existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Email and phone number already exist.",
        )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists.",
        )

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number already exists.",
        )

    # --------------------------------------------------------
    # Password
    # --------------------------------------------------------

    hashed_password = pwd_context.hash(
        user["password"]
    )

    # --------------------------------------------------------
    # Create user
    # --------------------------------------------------------

    new_user = User(
        first_name=user["first_name"].strip(),
        last_name=user["last_name"].strip(),
        email=email,
        phone=phone,
        country_code=country_code,
        password=hashed_password,
        role=user["role"],
        other_role=user.get("other_role", ""),
        experience=user.get("experience", "0"),
        auth_provider="local",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    print("================================")
    print("User Saved Successfully")
    print("ID:", new_user.id)
    print("Email:", new_user.email)
    print(
        "Phone:",
        new_user.country_code,
        new_user.phone,
    )
    print("Provider:", new_user.auth_provider)
    print("================================")

    return {
        "message": "Account created successfully",
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    user: dict,
    db: Session = Depends(get_db),
):

    email = user["email"].strip().lower()

    db_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    # --------------------------------------------------------
    # Google accounts cannot use normal password login
    # --------------------------------------------------------

    if db_user.auth_provider == "google":
        raise HTTPException(
            status_code=400,
            detail="This account uses Google sign-in. Please continue with Google.",
        )

    if not pwd_context.verify(
        user["password"],
        db_user.password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return {
        "message": "Login successful",
        "user": user_response(db_user),
    }


# ============================================================
# FORGOT PASSWORD
# ============================================================

@router.post("/forgot-password")
def forgot_password(
    payload: dict,
    db: Session = Depends(get_db),
):

    email = (
        payload.get("email", "")
        .strip()
        .lower()
    )

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email address is required."
        )

    if not email.endswith("@gmail.com"):
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid Gmail address."
        )

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No ResumeLens account exists with this email."
        )

    # Google accounts don't have a local password
    if user.auth_provider == "google":
        raise HTTPException(
            status_code=400,
            detail="This account uses Google sign-in. Please continue with Google."
        )

    # Generate 6 digit OTP
    otp = str(
        secrets.randbelow(900000) + 100000
    )

    user.reset_otp = otp

    user.reset_otp_expires = (
        datetime.utcnow() + timedelta(minutes=10)
    )

    db.commit()

    send_reset_otp(
        email,
        otp
    )

    return {
        "message": "A password reset OTP has been sent to your Gmail address."
    }


# ============================================================
# VERIFY RESET OTP
# ============================================================

@router.post("/verify-reset-otp")
def verify_reset_otp(
    payload: dict,
    db: Session = Depends(get_db),
):

    email = (
        payload.get("email", "")
        .strip()
        .lower()
    )

    otp = (
        payload.get("otp", "")
        .strip()
    )

    if not email or not otp:
        raise HTTPException(
            status_code=400,
            detail="Email and OTP are required."
        )

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Account not found."
        )

    if not user.reset_otp:
        raise HTTPException(
            status_code=400,
            detail="No password reset request found."
        )

    if not user.reset_otp_expires:
        raise HTTPException(
            status_code=400,
            detail="Password reset OTP has expired."
        )

    if datetime.utcnow() > user.reset_otp_expires:

        user.reset_otp = None
        user.reset_otp_expires = None

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new OTP."
        )

    if user.reset_otp != otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    return {
        "message": "OTP verified successfully."
    }


# ============================================================
# RESET PASSWORD
# ============================================================

# ============================================================
# RESET PASSWORD
# ============================================================

@router.post("/reset-password")
def reset_password(
    payload: dict,
    db: Session = Depends(get_db),
):

    email = (
        payload.get("email", "")
        .strip()
        .lower()
    )

    otp = (
        payload.get("otp", "")
        .strip()
    )

    new_password = (
        payload.get("new_password", "")
    )

    # --------------------------------------------------------
    # BASIC VALIDATION
    # --------------------------------------------------------

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email address is required."
        )

    if not otp:
        raise HTTPException(
            status_code=400,
            detail="OTP is required."
        )

    if not new_password:
        raise HTTPException(
            status_code=400,
            detail="New password is required."
        )

    if len(new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters."
        )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Account not found."
        )

    # --------------------------------------------------------
    # GOOGLE ACCOUNT CHECK
    # --------------------------------------------------------

    if not user.password:
        raise HTTPException(
            status_code=400,
            detail="This account uses Google sign-in. Please continue with Google."
        )

    # --------------------------------------------------------
    # CHECK OTP
    # --------------------------------------------------------

    if not user.reset_otp:
        raise HTTPException(
            status_code=400,
            detail="No password reset request found. Please request a new OTP."
        )

    if not user.reset_otp_expires:
        raise HTTPException(
            status_code=400,
            detail="Password reset OTP has expired. Please request a new OTP."
        )

    # --------------------------------------------------------
    # CHECK OTP EXPIRY
    # --------------------------------------------------------

    if datetime.utcnow() > user.reset_otp_expires:

        user.reset_otp = None
        user.reset_otp_expires = None

        db.commit()

        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new OTP."
        )

    # --------------------------------------------------------
    # CHECK OTP VALUE
    # --------------------------------------------------------

    if user.reset_otp != otp:

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    # --------------------------------------------------------
    # PREVENT SAME PASSWORD
    # --------------------------------------------------------

    try:

        if pwd_context.verify(
            new_password,
            user.password
        ):

            raise HTTPException(
                status_code=400,
                detail="New password must be different from your old password."
            )

    except HTTPException:
        raise

    except Exception as error:

        print(
            "Password verification error:",
            error
        )

    # --------------------------------------------------------
    # HASH NEW PASSWORD
    # --------------------------------------------------------

    try:

        user.password = pwd_context.hash(
            new_password
        )

        # OTP can only be used once
        user.reset_otp = None
        user.reset_otp_expires = None

        db.commit()

        db.refresh(user)

    except Exception as error:

        db.rollback()

        print("====================================")
        print("PASSWORD RESET DATABASE ERROR")
        print(error)
        print("====================================")

        raise HTTPException(
            status_code=500,
            detail=f"Password reset database error: {str(error)}"
        )

    # --------------------------------------------------------
    # SUCCESS
    # --------------------------------------------------------

    return {
        "message": "Password reset successfully."
    }

# ============================================================
# GOOGLE AUTHENTICATION
# ============================================================

@router.post("/google-login")
def google_login(
    payload: dict,
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # Validate configuration
    # --------------------------------------------------------

    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="Google authentication is not configured on the server.",
        )

    google_token = payload.get("credential")

    if not google_token:
        raise HTTPException(
            status_code=400,
            detail="Google credential is missing.",
        )

    # --------------------------------------------------------
    # Verify Google ID token
    # --------------------------------------------------------

    try:

        google_user = id_token.verify_oauth2_token(
            google_token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )

    except ValueError as error:

        print("Google token verification failed:", error)

        raise HTTPException(
            status_code=401,
            detail="Invalid Google authentication.",
        )

    # --------------------------------------------------------
    # Extract Google information
    # --------------------------------------------------------

    google_id = google_user.get("sub")
    email = google_user.get("email", "").strip().lower()

    first_name = (
        google_user.get("given_name")
        or ""
    ).strip()

    last_name = (
        google_user.get("family_name")
        or ""
    ).strip()

    email_verified = google_user.get(
        "email_verified",
        False,
    )

    # --------------------------------------------------------
    # Validate Google identity
    # --------------------------------------------------------

    if not google_id or not email:
        raise HTTPException(
            status_code=400,
            detail="Google account information is incomplete.",
        )

    if not email_verified:
        raise HTTPException(
            status_code=400,
            detail="Your Google email is not verified.",
        )

    # --------------------------------------------------------
    # Find by Google ID first
    # --------------------------------------------------------

    db_user = (
        db.query(User)
        .filter(User.google_id == google_id)
        .first()
    )

    # --------------------------------------------------------
    # If Google ID doesn't exist, check email
    # --------------------------------------------------------

    if not db_user:

        db_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

    # ========================================================
    # EXISTING USER
    # ========================================================

    if db_user:

        # ----------------------------------------------------
        # Link Google to an existing account
        # ----------------------------------------------------

        if not db_user.google_id:
            db_user.google_id = google_id

        db_user.auth_provider = "google"

        # Fill missing names if necessary
        if not db_user.first_name and first_name:
            db_user.first_name = first_name

        if not db_user.last_name and last_name:
            db_user.last_name = last_name

        db.commit()
        db.refresh(db_user)

        print("================================")
        print("Google Login Successful")
        print("ID:", db_user.id)
        print("Email:", db_user.email)
        print("Provider:", db_user.auth_provider)
        print("================================")

        return {
            "message": "Google login successful",
            "user": user_response(db_user),
        }

    # ========================================================
    # NEW GOOGLE USER
    # ========================================================

    # Google accounts don't have a local password.
    # Generate a random unusable password value because
    # the existing database schema requires password.
    random_password = secrets.token_urlsafe(32)

    hashed_password = pwd_context.hash(
        random_password
    )

    new_user = User(
        first_name=first_name or "Google",
        last_name=last_name or "User",
        email=email,
        phone="0000000000",
        country_code="+91",
        password=hashed_password,
        role="student",
        other_role="",
        experience="0",
        google_id=google_id,
        auth_provider="google",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    print("================================")
    print("New Google User Created")
    print("ID:", new_user.id)
    print("Email:", new_user.email)
    print("Provider:", new_user.auth_provider)
    print("================================")

    return {
        "message": "Google account created successfully",
        "user": user_response(new_user),
    }

# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.put("/change-password/{user_id}")
def change_password(
    user_id: int,
    payload: dict,
    db: Session = Depends(get_db)
):

    current_password = payload.get("current_password", "")
    new_password = payload.get("new_password", "")

    if not current_password or not new_password:
        raise HTTPException(
            status_code=400,
            detail="Current password and new password are required."
        )

    if len(new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters."
        )

    if len(new_password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=400,
            detail="New password cannot be longer than 72 bytes."
        )

    if len(new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters."
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # Verify current password
    if not pwd_context.verify(
        current_password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Current password is incorrect."
        )

    # Prevent using same password
    if pwd_context.verify(
        new_password,
        user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from your current password."
        )

    user.password = pwd_context.hash(new_password)

    db.commit()

    return {
        "message": "Password changed successfully."
    }


# ============================================================
# DELETE ACCOUNT
# ============================================================

@router.delete("/account/{user_id}")
def delete_account(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # Delete resume analysis history first
    db.query(ResumeAnalysis).filter(
        ResumeAnalysis.user_id == user_id
    ).delete(
        synchronize_session=False
    )

    # Delete user
    db.delete(user)

    db.commit()

    print("================================")
    print("Account Deleted Successfully")
    print("User ID:", user_id)
    print("================================")

    return {
        "message": "Account deleted successfully."
    }