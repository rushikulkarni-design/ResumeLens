from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String, nullable=False)

    last_name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    phone = Column(String, nullable=True)

    country_code = Column(
        String,
        default="+91"
    )

    password = Column(String, nullable=True)

    google_id = Column(
        String,
        unique=True,
        nullable=True
    )

    auth_provider = Column(
        String,
        default="local",
        nullable=False
    )

    reset_otp = Column(String, nullable=True)

    reset_otp_expires = Column(DateTime, nullable=True)

    role = Column(
        String,
        nullable=False,
        default="student"
    )

    other_role = Column(
        String,
        nullable=True
    )

    experience = Column(
        String,
        default="0"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Settings

    email_notifications = Column(
        Boolean,
        default=True
    )

    product_updates = Column(
        Boolean,
        default=False
    )

    retain_files = Column(
        Boolean,
        default=True
    )


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False,
        index=True
    )

    resume_name = Column(
        String,
        nullable=False
    )

    resume_size = Column(
        String,
        nullable=True
    )

    ats_score = Column(
        Integer,
        nullable=False
    )

    recommended_role = Column(
        String,
        nullable=True
    )

    skills = Column(
        String,
        nullable=True
    )

    missing_skills = Column(
        String,
        nullable=True
    )

    ai_feedback = Column(
        String,
        nullable=True
    )

    resume_text = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )