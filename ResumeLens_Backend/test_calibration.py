from resume_evidence import extract_resume_evidence
from resume_scoring import calculate_resume_score


def score_resume(name, resume_text):
    evidence = extract_resume_evidence(
        resume_text
    )

    print()
    print("DEBUG EVIDENCE")
    print("Projects:", evidence.get("projects"))
    print("Technical Evidence:", evidence.get("technical_evidence"))
    print("Skills:", evidence.get("skills"))
    print()

    result = calculate_resume_score(
        resume_text=resume_text,
        resume_evidence=evidence,
        job_title="Software Developer",
    )

    print()
    print("================================")
    print(name)
    print("================================")
    print(
        "Final Score:",
        result["final_score"],
    )

    print(
        "Technical Capability:",
        result["component_scores"].get(
            "technical_capability",
            0,
        ),
    )

    print(
        "Role Skill Coverage:",
        result["component_scores"].get(
            "role_skill_coverage",
            0,
        ),
    )

    print(
        "Project Evidence:",
        result["component_scores"].get(
            "project_evidence",
            0,
        ),
    )

    print(
        "Technical Depth:",
        result["component_scores"].get(
            "technical_depth",
            0,
        ),
    )

    print(
        "Resume Quality:",
        result["component_scores"].get(
            "resume_quality",
            0,
        ),
    )

    return result


# ============================================================
# 1. WEAK RESUME
# ============================================================

weak_resume = """
Software Developer

TECHNICAL SKILLS
Python

EDUCATION
B.Tech
"""


# ============================================================
# 2. AVERAGE RESUME
# ============================================================

average_resume = """
Software Developer

TECHNICAL SKILLS
Python
Java
C
Data Structures

PROJECTS
Student Management Application — Academic Project | 2025

Developed a basic application using Python.
Implemented simple application logic.

EDUCATION
B.Tech in Computer Science

CERTIFICATIONS
Python Programming Certification
"""


# ============================================================
# 3. CURRENT ENTRY-LEVEL RESUME
# ============================================================

current_resume = """
Software Developer | B.Tech Artificial Intelligence & Data Science

Entry-level developer with hands-on experience building
functional web applications, automation prototypes, and
Python-based AI/data solutions.

Strong foundation in C, Python, and Java, with practical
exposure to data structures, application logic, APIs,
and software-oriented problem solving.

TECHNICAL SKILLS

Programming C, Python, Java

Development Web application development, application logic,
automation, problem solving, debugging

Python / Data NumPy, Pandas, Matplotlib

Core Data Structures, Programming Fundamentals,
Research & Documentation

PROJECTS

Solar Power Awareness & Investment Estimator — Community Engineering Project | Nov 2024

Developed an informative web application focused on making
solar-energy information accessible.

Implemented a custom investment-estimator calculator to
support user-side decision making through application logic.

Automatic Door Opening & Closing System — Engineering Exploration Project | Jun 2024

Designed and developed a functional automated-door prototype
using sensors and microcontrollers.

Implemented motion detection logic to trigger the door
mechanism automatically.

EDUCATION

B.Tech in Artificial Intelligence and Data Science

CERTIFICATIONS

Java Programming Certification

Programming with Python 3.X

Data Structures in C
"""


# ============================================================
# 4. STRONG / PREMIUM RESUME
# ============================================================

premium_resume = """
Senior Software Engineer

PROFESSIONAL SUMMARY

Software engineer with 5+ years of experience designing,
developing, testing, deploying, and maintaining scalable
production applications.

TECHNICAL SKILLS

Python
Java
C++
C#
JavaScript
TypeScript
SQL
PostgreSQL
Data Structures
Algorithms
Object Oriented Programming
REST API
Git
GitHub
Docker
Linux
Kubernetes
AWS
CI/CD
Agile
Scrum
SDLC
Unit Testing
Pytest
React

EXPERIENCE

Software Engineer

Designed and developed production REST APIs using Python
and Java.

Built scalable backend services and database integrations.

Used Git and GitHub for collaborative development.

Containerized applications using Docker.

Deployed services on Linux and AWS infrastructure.

Implemented automated unit testing and CI/CD pipelines.

Worked in Agile Scrum teams following SDLC practices.

PROJECTS

Scalable E-Commerce Platform — Production Project | 2025

Designed and developed a full-stack web application.

Implemented REST APIs, authentication, SQL databases,
Docker containers, automated testing, and CI/CD.

Real-Time Analytics Platform — Engineering Project | 2024

Built a data processing application using Python,
PostgreSQL, Docker, and AWS.

EDUCATION

B.Tech in Computer Science and Engineering

CERTIFICATIONS

AWS Certified Developer
Docker Certification
Python Professional Certification
Java Certification
"""


# ============================================================
# RUN CALIBRATION
# ============================================================

score_resume(
    "WEAK RESUME",
    weak_resume,
)

score_resume(
    "AVERAGE RESUME",
    average_resume,
)

score_resume(
    "CURRENT RESUME",
    current_resume,
)

score_resume(
    "PREMIUM RESUME",
    premium_resume,
)