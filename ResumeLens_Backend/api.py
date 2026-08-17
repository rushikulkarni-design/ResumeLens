import json
import os
import re
import tempfile

from dotenv import load_dotenv
load_dotenv()
import pdfplumber

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import (
    Base,
    engine,
    get_db,
    migrate_database,
)

from auth import router as auth_router

from models import User, ResumeAnalysis

from skill_groups import (
    get_groups_for_skills,
    calculate_group_coverage,
)

from resume_evidence import (
    extract_resume_evidence,
)

from resume_scoring import (
    calculate_resume_score,
)

from job_loader import (
    get_job_titles,
    get_job_skills,
)

from role_profile import (
    build_role_profile,
)

from utils.ats import (
    calculate_ats_score,
)

from utils.gemini_ai import (
    analyze_resume,
)

from utils.recommendations import (
    build_skill_recommendations,
)


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="AI Resume Analyzer API",
    version="1.0.0",
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)

migrate_database()


# ============================================================
# AUTH ROUTER
# ============================================================

app.include_router(auth_router)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PROFILE REQUEST MODEL
# ============================================================

class ProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    country_code: str = "+91"
    role: str
    other_role: str = ""
    experience: str


# ============================================================
# SETTINGS REQUEST MODEL
# ============================================================

class SettingsUpdate(BaseModel):
    email_notifications: bool
    product_updates: bool
    retain_files: bool


# ============================================================
# DOCUMENT VALIDATION
# ============================================================

def normalize_resume_text(text: str) -> str:
    """
    Normalize extracted PDF text before validation.
    """

    if not text:
        return ""

    text = text.replace("\x00", " ")

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def validate_resume_document(text: str) -> None:
    """
    Validate whether an uploaded PDF appears to be a resume.

    This intentionally uses multiple signals rather than requiring
    a fixed resume template so that student, fresher, technical,
    and experienced resumes are accepted.
    """

    normalized = normalize_resume_text(text)

    # --------------------------------------------------------
    # Empty / unreadable PDF
    # --------------------------------------------------------

    if len(normalized) < 80:
        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded PDF does not contain enough "
                "readable text to analyze. Please upload a "
                "valid resume PDF."
            ),
        )

    text_lower = normalized.lower()

    # --------------------------------------------------------
    # Strong non-resume document indicators
    # --------------------------------------------------------

    non_resume_patterns = [
        "consumer number",
        "bill number",
        "bill amount",
        "monthly units",
        "property type",
        "customer information",
        "electricity bill",
        "utility bill",
        "invoice number",
        "invoice",
        "payment receipt",
        "tax invoice",
        "transaction statement",
        "bank statement",
        "account statement",
        "recommendation report",
        "analysis report",
        "solar recommendation",
        "solar powered",
        "solariq",
    ]

    non_resume_matches = [
        phrase
        for phrase in non_resume_patterns
        if phrase in text_lower
    ]

    # --------------------------------------------------------
    # Resume indicators
    # --------------------------------------------------------

    resume_patterns = {
        "experience": [
            "work experience",
            "professional experience",
            "employment",
            "experience",
            "internship",
            "internships",
        ],
        "education": [
            "education",
            "academic background",
            "qualification",
            "qualifications",
            "degree",
            "b.tech",
            "btech",
            "b.e.",
            "bachelor",
            "master",
            "university",
            "college",
        ],
        "skills": [
            "technical skills",
            "skills",
            "technical skill",
            "programming languages",
            "technologies",
            "tools",
            "competencies",
        ],
        "projects": [
            "projects",
            "project experience",
            "academic projects",
            "personal projects",
        ],
        "certifications": [
            "certifications",
            "certification",
            "certificates",
        ],
        "summary": [
            "professional summary",
            "career objective",
            "objective",
            "profile summary",
            "about me",
        ],
        "contact": [
            "email",
            "phone",
            "linkedin",
            "github",
            "contact",
        ],
    }

    matched_categories = set()

    for category, phrases in resume_patterns.items():

        for phrase in phrases:

            if phrase in text_lower:
                matched_categories.add(category)
                break

    # --------------------------------------------------------
    # Detect common resume contact evidence
    # --------------------------------------------------------

    has_email = bool(
        re.search(
            r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
            normalized,
            re.IGNORECASE,
        )
    )

    has_phone = bool(
        re.search(
            r"(?:\+?\d[\d\s().-]{8,}\d)",
            normalized,
        )
    )

    has_linkedin = (
        "linkedin.com" in text_lower
    )

    has_github = (
        "github.com" in text_lower
    )

    if has_email or has_phone or has_linkedin or has_github:
        matched_categories.add("contact")

    # --------------------------------------------------------
    # Detect technical resume evidence
    # --------------------------------------------------------

    technical_terms = [
        "python",
        "java",
        "javascript",
        "typescript",
        "c++",
        "c#",
        "sql",
        "react",
        "node",
        "django",
        "flask",
        "spring",
        "api",
        "rest",
        "docker",
        "git",
        "github",
        "mysql",
        "postgresql",
        "mongodb",
        "machine learning",
        "data science",
        "artificial intelligence",
        "software development",
    ]

    technical_matches = [
        term
        for term in technical_terms
        if term in text_lower
    ]

    if len(technical_matches) >= 2:
        matched_categories.add("technical")

    # --------------------------------------------------------
    # Reject obvious non-resume documents
    # --------------------------------------------------------

    if (
        len(non_resume_matches) >= 2
        and len(matched_categories) < 3
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded PDF does not appear to be a resume. "
                "Please upload a professional resume containing "
                "sections such as Skills, Education, Projects, "
                "Experience, or Certifications."
            ),
        )

    # --------------------------------------------------------
    # General resume validation
    # --------------------------------------------------------

    if len(matched_categories) < 2:
        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded PDF does not appear to contain "
                "enough resume information. Please upload a "
                "valid resume PDF."
            ),
        )


# ============================================================
# REBUILD SKILL ANALYSIS
# ============================================================

def rebuild_skill_analysis(
    resume_text: str,
    job_title: str,
):
    """
    Rebuild skill matching and recommendation data
    without running the complete resume scoring pipeline.
    """

    job_title = job_title.strip()

    if not job_title:
        raise HTTPException(
            status_code=400,
            detail="Job title is required.",
        )

    required_skills = get_job_skills(
        job_title
    )

    if not required_skills:
        raise HTTPException(
            status_code=404,
            detail="Selected job title was not found.",
        )

    (
        _old_score,
        exact_matches,
        related_matches,
        contextual_matches,
        missing_skills,
    ) = calculate_ats_score(
        resume_text,
        required_skills,
    )

    role_profile = build_role_profile(
        job_title
    )

    role_competencies = role_profile.get(
        "competencies",
        {},
    )

    skill_groups = get_groups_for_skills(
        required_skills
    )

    group_coverage = calculate_group_coverage(
        required_skills,
        exact_matches,
        related_matches,
        contextual_matches,
    )

    skill_recommendations = (
        build_skill_recommendations(
            role_competencies=role_competencies,
            skill_groups=skill_groups,
            missing_skills=missing_skills,
            contextual_matches=contextual_matches,
            exact_matches=exact_matches,
            related_matches=related_matches,
        )
    )

    return {
        "required_skills": required_skills,
        "exact_matches": exact_matches,
        "related_matches": related_matches,
        "contextual_matches": contextual_matches,
        "missing_skills": missing_skills,
        "skill_groups": skill_groups,
        "group_coverage": group_coverage,
        "role_competencies": role_competencies,
        "skill_recommendations": skill_recommendations,
    }


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "AI Resume Analyzer API Running"
    }


# ============================================================
# ANALYZE RESUME
# ============================================================

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    job_title: str = Form(...),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # Validate job title
    # --------------------------------------------------------

    job_title = job_title.strip()

    if not job_title:
        raise HTTPException(
            status_code=400,
            detail="Job title is required.",
        )

    # --------------------------------------------------------
    # Validate uploaded file
    # --------------------------------------------------------

    filename = (
        file.filename
        or "Resume.pdf"
    )

    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail=(
                "Only PDF resume files are supported. "
                "Please upload a PDF resume."
            ),
        )

    # --------------------------------------------------------
    # Load required skills
    # --------------------------------------------------------

    required_skills = get_job_skills(
        job_title
    )

    if not required_skills:
        raise HTTPException(
            status_code=404,
            detail="Selected job title was not found.",
        )

    # --------------------------------------------------------
    # Save uploaded PDF temporarily
    # --------------------------------------------------------

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf",
    ) as temp:

        temp.write(
            await file.read()
        )

        temp_path = temp.name

    # --------------------------------------------------------
    # Extract resume text
    # --------------------------------------------------------

    text = ""

    try:

        with pdfplumber.open(
            temp_path
        ) as pdf:

            for page in pdf.pages:

                page_text = (
                    page.extract_text()
                )

                if page_text:
                    text += (
                        page_text + "\n"
                    )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded PDF could not be "
                f"read successfully: {str(e)}"
            ),
        )

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)

    # --------------------------------------------------------
    # VALIDATE DOCUMENT AS RESUME
    # --------------------------------------------------------

    validate_resume_document(
        text
    )

    # --------------------------------------------------------
    # Extract structured resume evidence
    # --------------------------------------------------------

    resume_evidence = (
        extract_resume_evidence(
            text
        )
    )

    # --------------------------------------------------------
    # Holistic resume score
    # --------------------------------------------------------

    score_result = calculate_resume_score(
        resume_text=text,
        resume_evidence=resume_evidence,
        job_title=job_title,
    )

    score = score_result[
        "final_score"
    ]

    # --------------------------------------------------------
    # Skill matching
    # --------------------------------------------------------

    (
        _old_score,
        exact_matches,
        related_matches,
        contextual_matches,
        missing,
    ) = calculate_ats_score(
        text,
        required_skills,
    )

    # --------------------------------------------------------
    # Role competency profile
    # --------------------------------------------------------

    role_profile = build_role_profile(
        job_title
    )

    role_competencies = (
        role_profile.get(
            "competencies",
            {},
        )
    )

    # --------------------------------------------------------
    # Skill groups
    # --------------------------------------------------------

    skill_groups = (
        get_groups_for_skills(
            required_skills
        )
    )

    # --------------------------------------------------------
    # Group coverage
    # --------------------------------------------------------

    group_coverage = (
        calculate_group_coverage(
            required_skills,
            exact_matches,
            related_matches,
            contextual_matches,
        )
    )

    # --------------------------------------------------------
    # Skill recommendations
    # --------------------------------------------------------

    skill_recommendations = (
        build_skill_recommendations(
            role_competencies=role_competencies,
            skill_groups=skill_groups,
            missing_skills=missing,
            contextual_matches=contextual_matches,
            exact_matches=exact_matches,
            related_matches=related_matches,
        )
    )

    # --------------------------------------------------------
    # Recommended role
    # --------------------------------------------------------

    role = job_title

    # --------------------------------------------------------
    # AI analysis
    # --------------------------------------------------------

    try:

        ai = analyze_resume(
            text
        )

    except Exception as e:

        print(
            "Gemini AI error:",
            str(e),
        )

        ai = {
            "error": (
                "Gemini AI is currently unavailable."
            ),
            "details": str(e),
        }

    # --------------------------------------------------------
    # Save analysis
    # --------------------------------------------------------

    new_analysis = ResumeAnalysis(

        user_id=user_id,

        resume_name=filename,

        resume_size=str(
            file.size or 0
        ),

        ats_score=score,

        recommended_role=role,

        skills=json.dumps(
            exact_matches
        ),

        missing_skills=json.dumps(
            missing
        ),

        ai_feedback=json.dumps(
            ai
        ),

        resume_text=text,
    )

    db.add(
        new_analysis
    )

    db.commit()

    db.refresh(
        new_analysis
    )

    # --------------------------------------------------------
    # Debug information
    # --------------------------------------------------------

    print(
        "\n================================"
    )

    print(
        "RESUME ANALYSIS SAVED"
    )

    print(
        "Analysis ID:",
        new_analysis.id,
    )

    print(
        "User ID:",
        new_analysis.user_id,
    )

    print(
        "Resume:",
        new_analysis.resume_name,
    )

    print(
        "Selected Job:",
        job_title,
    )

    print(
        "Required Skills:",
        required_skills,
    )

    print(
        "Skill Groups:",
        skill_groups,
    )

    print(
        "Group Coverage:",
        group_coverage,
    )

    print(
        "Exact Matches:",
        exact_matches,
    )

    print(
        "Related Matches:",
        related_matches,
    )

    print(
        "Contextual Matches:",
        contextual_matches,
    )

    print(
        "Missing Skills:",
        missing,
    )

    print(
        "Skill Recommendations:",
        skill_recommendations,
    )

    print(
        "ATS Score:",
        new_analysis.ats_score,
    )

    print(
        "================================"
    )

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "id": new_analysis.id,

        "job_title": job_title,

        "required_skills": required_skills,

        "ats_score": score,

        "score_breakdown":
            score_result[
                "component_scores"
            ],

        "score_weights":
            score_result[
                "weights"
            ],

        "skills":
            resume_evidence.get(
                "skills",
                [],
            ),

        "exact_matches":
            exact_matches,

        "related_matches":
            related_matches,

        "skill_groups":
            skill_groups,

        "group_coverage":
            group_coverage,

        "role_competencies":
            role_competencies,

        "contextual_matches":
            contextual_matches,

        "missing_skills":
            missing,

        "skill_recommendations":
            skill_recommendations,

        "recommended_role":
            role,

        "ai_feedback":
            ai,

        "resume_text":
            text,
    }


# ============================================================
# GET USER HISTORY
# ============================================================

@app.get("/history/{user_id}")
def get_history(
    user_id: int,
    db: Session = Depends(get_db),
):

    analyses = (
        db.query(
            ResumeAnalysis
        )
        .filter(
            ResumeAnalysis.user_id
            == user_id
        )
        .order_by(
            ResumeAnalysis.created_at.desc()
        )
        .all()
    )

    history = []

    for item in analyses:

        history.append({

            "id": item.id,

            "name":
                item.resume_name,

            "size":
                item.resume_size,

            "score":
                item.ats_score,

            "role":
                item.recommended_role,

            "skills":
                json.loads(
                    item.skills
                    or "[]"
                ),

            "missing_skills":
                json.loads(
                    item.missing_skills
                    or "[]"
                ),

            "ai_feedback":
                json.loads(
                    item.ai_feedback
                    or "{}"
                ),

            "resume_text":
                item.resume_text,

            "date": (
                item.created_at.strftime(
                    "%b %d, %Y"
                )
                if item.created_at
                else ""
            ),
        })

    return history


# ============================================================
# GET SINGLE ANALYSIS
# ============================================================

@app.get(
    "/history/{user_id}/{analysis_id}"
)
def get_single_history(
    user_id: int,
    analysis_id: int,
    db: Session = Depends(get_db),
):

    analysis = (
        db.query(
            ResumeAnalysis
        )
        .filter(
            ResumeAnalysis.id
            == analysis_id,

            ResumeAnalysis.user_id
            == user_id,
        )
        .first()
    )

    if not analysis:

        raise HTTPException(
            status_code=404,
            detail="Analysis not found",
        )

    return {

        "id":
            analysis.id,

        "name":
            analysis.resume_name,

        "size":
            analysis.resume_size,

        "score":
            analysis.ats_score,

        "ats_score":
            analysis.ats_score,

        "recommended_role":
            analysis.recommended_role,

        "skills":
            json.loads(
                analysis.skills
                or "[]"
            ),

        "missing_skills":
            json.loads(
                analysis.missing_skills
                or "[]"
            ),

        "ai_feedback":
            json.loads(
                analysis.ai_feedback
                or "{}"
            ),

        "resume_text":
            analysis.resume_text,

        "date": (
            analysis.created_at.strftime(
                "%b %d, %Y"
            )
            if analysis.created_at
            else ""
        ),
    }


# ============================================================
# DELETE ANALYSIS
# ============================================================

@app.delete(
    "/history/{user_id}/{analysis_id}"
)
def delete_history(
    user_id: int,
    analysis_id: int,
    db: Session = Depends(get_db),
):

    analysis = (
        db.query(
            ResumeAnalysis
        )
        .filter(
            ResumeAnalysis.id
            == analysis_id,

            ResumeAnalysis.user_id
            == user_id,
        )
        .first()
    )

    if not analysis:

        raise HTTPException(
            status_code=404,
            detail="Analysis not found",
        )

    db.delete(
        analysis
    )

    db.commit()

    return {
        "success": True,
        "message":
            "Analysis deleted successfully",
    }


# ============================================================
# GET USER PROFILE
# ============================================================

@app.get(
    "/profile/{user_id}"
)
def get_profile(
    user_id: int,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return {

        "id":
            user.id,

        "first_name":
            user.first_name,

        "last_name":
            user.last_name,

        "email":
            user.email,

        "phone":
            user.phone,

        "country_code":
            user.country_code or "+91",

        "role":
            user.role,

        "other_role":
            user.other_role or "",

        "experience":
            user.experience,

        "created_at": (
            user.created_at.strftime(
                "%b %d, %Y"
            )
            if user.created_at
            else ""
        ),
    }


# ============================================================
# GET USER SETTINGS
# ============================================================

@app.get(
    "/settings/{user_id}"
)
def get_settings(
    user_id: int,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return {

        "email_notifications":
            user.email_notifications,

        "product_updates":
            user.product_updates,

        "retain_files":
            user.retain_files,
    }


# ============================================================
# UPDATE USER SETTINGS
# ============================================================

@app.put(
    "/settings/{user_id}"
)
def update_settings(
    user_id: int,
    settings: SettingsUpdate,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.email_notifications = (
        settings.email_notifications
    )

    user.product_updates = (
        settings.product_updates
    )

    user.retain_files = (
        settings.retain_files
    )

    db.commit()

    db.refresh(user)

    return {

        "success": True,

        "message":
            "Settings saved successfully",

        "settings": {

            "email_notifications":
                user.email_notifications,

            "product_updates":
                user.product_updates,

            "retain_files":
                user.retain_files,
        },
    }


# ============================================================
# UPDATE USER PROFILE
# ============================================================

@app.put(
    "/profile/{user_id}"
)
def update_profile(
    user_id: int,
    profile: ProfileUpdate,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # --------------------------------------------------------
    # Prevent duplicate email
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email
            == profile.email,

            User.id
            != user_id,
        )
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail=(
                "Email is already registered "
                "to another account."
            ),
        )

    # --------------------------------------------------------
    # Validate phone
    # --------------------------------------------------------

    if (
        not profile.phone.isdigit()
        or len(profile.phone) != 10
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Phone number must contain "
                "exactly 10 digits."
            ),
        )

    # --------------------------------------------------------
    # Update user
    # --------------------------------------------------------

    user.first_name = (
        profile.first_name
    )

    user.last_name = (
        profile.last_name
    )

    user.email = (
        profile.email
    )

    user.phone = (
        profile.phone
    )

    user.country_code = (
        profile.country_code
        or "+91"
    )

    user.role = (
        profile.role
    )

    user.other_role = (
        profile.other_role
        if profile.role == "other"
        else ""
    )

    user.experience = (
        profile.experience
    )

    db.commit()

    db.refresh(user)

    return {

        "success": True,

        "message":
            "Profile updated successfully",

        "user": {

            "id":
                user.id,

            "first_name":
                user.first_name,

            "last_name":
                user.last_name,

            "email":
                user.email,

            "phone":
                user.phone,

            "country_code":
                user.country_code
                or "+91",

            "role":
                user.role,

            "other_role":
                user.other_role
                or "",

            "experience":
                user.experience,
        },
    }


# ============================================================
# JOB TITLES
# ============================================================

@app.get(
    "/job-titles"
)
def job_titles():

    titles = get_job_titles()

    return {
        "count":
            len(titles),

        "job_titles":
            titles,
    }


# ============================================================
# JOB SKILLS
# ============================================================

@app.get(
    "/job-skills/{job_title}"
)
def job_skills(
    job_title: str
):

    skills = get_job_skills(
        job_title
    )

    if not skills:

        raise HTTPException(
            status_code=404,
            detail="Job title not found.",
        )

    return {

        "job_title":
            job_title,

        "skill_count":
            len(skills),

        "skills":
            skills,
    }