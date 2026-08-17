import re


# ============================================================
# TEXT HELPERS
# ============================================================

def clean_text(text: str) -> str:
    """
    Clean extracted resume text while preserving
    useful technical information.
    """

    if not text:
        return ""

    text = text.replace("\r", "\n")

    # Remove excessive spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    return text.strip()


def normalize_line(line: str) -> str:
    """
    Normalize one resume line.
    """

    line = line.strip()

    # Remove common bullet characters
    line = re.sub(
        r"^[•●▪◦\-*]+\s*",
        "",
        line,
    )

    return line.strip()


# ============================================================
# SECTION DETECTION
# ============================================================

SECTION_ALIASES = {

    "skills": [
        "technical skills",
        "technical skill",
        "skills",
        "skill set",
        "core skills",
        "technical expertise",
        "technologies",
        "tech stack",
    ],

    "projects": [
        "projects",
        "project",
        "academic projects",
        "personal projects",
        "technical projects",
    ],

    "experience": [
        "experience",
        "work experience",
        "professional experience",
        "internship",
        "internships",
        "employment",
    ],

    "education": [
        "education",
        "academic background",
        "educational background",
    ],

    "certifications": [
        "certifications",
        "certification",
        "certificates",
        "courses",
        "training",
    ],

    "achievements": [
        "achievements",
        "accomplishments",
        "awards",
        "honors",
    ],

    "languages": [
        "languages",
        "language",
    ],
}

def detect_section(line: str):
    """
    Determine whether a line is a known resume section heading.
    """

    normalized = line.lower().strip()

    # Remove punctuation around headings
    normalized = re.sub(
        r"[:\-|]+$",
        "",
        normalized,
    ).strip()

    for section, aliases in SECTION_ALIASES.items():

        for alias in aliases:

            if normalized == alias:
                return section

    return None


# ============================================================
# SECTION EXTRACTION
# ============================================================

def extract_sections(text: str):
    """
    Split resume into logical sections.
    """

    lines = [
        normalize_line(line)
        for line in clean_text(text).split("\n")
    ]

    lines = [
        line
        for line in lines
        if line
    ]

    sections = {
        "header": [],
        "skills": [],
        "projects": [],
        "experience": [],
        "education": [],
        "certifications": [],
        "achievements": [],
        "languages": [],
        "other": [],
    }

    current_section = "header"

    for line in lines:

        detected = detect_section(line)

        if detected:
            current_section = detected
            continue

        sections[current_section].append(
            line
        )

    return sections


# ============================================================
# SKILL EXTRACTION
# ============================================================

COMMON_TECHNICAL_SKILLS = [

    # Programming languages
    "Python",
    "Java",
    "C",
    "C++",
    "C#",
    "JavaScript",
    "TypeScript",
    "Go",
    "Golang",
    "Rust",
    "PHP",
    "Ruby",
    "Kotlin",
    "Swift",

    # Data
    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Oracle",
    "Pandas",
    "NumPy",
    "Matplotlib",
    "Power BI",
    "Tableau",

    # Development
    "Data Structures",
    "Algorithms",
    "OOP",
    "Object Oriented Programming",
    "REST API",
    "APIs",
    "API",
    "Web Development",
    "Web Application Development",
    "Application Development",
    "Application Logic",

    # Tools
    "Git",
    "GitHub",
    "Docker",
    "Linux",
    "Jenkins",

    # Cloud
    "AWS",
    "Azure",
    "GCP",
    "Google Cloud",

    # AI / ML
    "Machine Learning",
    "Deep Learning",
    "Artificial Intelligence",
    "Natural Language Processing",
    "Computer Vision",

    # Testing
    "Unit Testing",
    "Automation Testing",
    "Selenium",
    "PyTest",

    # Practices
    "Agile",
    "Scrum",
    "SDLC",

    # Frameworks
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Django",
    "Flask",
    "FastAPI",
    "Spring",
    "Spring Boot",
]


def contains_skill(
    text: str,
    skill: str,
):
    """
    Check whether a technical skill appears
    in text without matching it inside another word.
    """

    normalized_text = text.lower()

    normalized_skill = skill.lower()

    # Technical symbols need direct matching
    if "+" in normalized_skill or "#" in normalized_skill:
        return normalized_skill in normalized_text

    # Multi-word skills
    if " " in normalized_skill:
        return normalized_skill in normalized_text

    pattern = (
        r"(?<![a-z0-9])"
        + re.escape(normalized_skill)
        + r"(?![a-z0-9])"
    )

    return re.search(
        pattern,
        normalized_text,
    ) is not None


def extract_skills(
    text: str,
):
    """
    Extract recognizable technical skills
    from the entire resume.
    """

    found = []

    for skill in COMMON_TECHNICAL_SKILLS:

        if contains_skill(
            text,
            skill,
        ):
            found.append(skill)

    return found


# ============================================================
# PROJECT EXTRACTION
# ============================================================

def extract_projects(
    project_lines,
):
    """
    Extract project entries from the Projects section.

    We keep the original text instead of trying to
    aggressively interpret it.
    """

    projects = []

    current_project = None

    for line in project_lines:

        # Bullet/project description
        if line.startswith(
            (
                "Developed ",
                "Designed ",
                "Implemented ",
                "Built ",
                "Created ",
                "Focused ",
                "Structured ",
                "Worked ",
                "Used ",
            )
        ):

            if current_project:
                current_project[
                    "description"
                ].append(line)

            continue

        # Detect likely project title
        if (
            "—" in line
            or "|" in line
            or " - " in line
        ):

            if current_project:
                projects.append(
                    current_project
                )

            current_project = {
                "title": line,
                "description": [],
            }

            continue

        # General project line
        if current_project:
            current_project[
                "description"
            ].append(line)

    if current_project:
        projects.append(
            current_project
        )

    return projects


# ============================================================
# EDUCATION EXTRACTION
# ============================================================

def extract_education(
    education_lines,
):
    """
    Preserve education information as structured entries.
    """

    education = []

    for line in education_lines:

        education.append(line)

    return education


# ============================================================
# CERTIFICATION EXTRACTION
# ============================================================

def extract_certifications(
    certification_lines,
):
    """
    Extract certification entries.
    """

    certifications = []

    for line in certification_lines:

        certifications.append(line)

    return certifications


# ============================================================
# TECHNICAL EVIDENCE
# ============================================================

def extract_technical_evidence(
    text: str,
):
    """
    Identify sentences/lines that demonstrate
    actual technical activity.

    We look for action-oriented evidence such as:

        developed
        built
        implemented
        designed
        created
        automated
        debugged
        structured
        integrated
        deployed
    """

    action_words = [
        "developed",
        "built",
        "implemented",
        "designed",
        "created",
        "automated",
        "debugged",
        "structured",
        "integrated",
        "deployed",
        "configured",
        "programmed",
        "tested",
        "engineered",
        "analyzed",
    ]

    evidence = []

    for line in clean_text(text).split("\n"):

        line = normalize_line(line)

        if not line:
            continue

        lower_line = line.lower()

        if any(
            word in lower_line
            for word in action_words
        ):

            evidence.append(line)

    return evidence


# ============================================================
# DEVELOPMENT EVIDENCE
# ============================================================

def extract_development_evidence(
    text: str,
):
    """
    Identify evidence related to software development,
    problem solving, applications, APIs, debugging,
    automation, and programming.
    """

    development_terms = [
        "software development",
        "software developer",
        "web application",
        "application development",
        "application logic",
        "programming",
        "debugging",
        "problem solving",
        "api",
        "apis",
        "automation",
        "data structures",
        "algorithms",
        "programming fundamentals",
        "software-oriented",
    ]

    evidence = []

    for line in clean_text(text).split("\n"):

        line = normalize_line(line)

        if not line:
            continue

        lower_line = line.lower()

        if any(
            term in lower_line
            for term in development_terms
        ):

            evidence.append(line)

    return evidence


# ============================================================
# RESUME QUALITY SIGNALS
# ============================================================

def calculate_resume_quality_signals(
    sections,
):
    """
    Calculate simple structural signals.

    These are NOT the final ATS score.
    They are evidence for the future scoring engine.
    """

    signals = {
        "has_skills_section": bool(
            sections["skills"]
        ),

        "has_projects_section": bool(
            sections["projects"]
        ),

        "has_experience_section": bool(
            sections["experience"]
        ),

        "has_education_section": bool(
            sections["education"]
        ),

        "has_certifications_section": bool(
            sections["certifications"]
        ),

        "project_count": 0,

        "education_entries": len(
            sections["education"]
        ),

        "certification_count": len(
            sections["certifications"]
        ),

        "has_languages_section": bool(
            sections["languages"]
        ),

    }

    return signals


# ============================================================
# MAIN EVIDENCE EXTRACTOR
# ============================================================

def extract_resume_evidence(
    resume_text: str,
):
    """
    Convert raw resume text into structured evidence.

    This function does NOT calculate ATS score.

    It only extracts evidence that the future
    scoring engine will use.
    """

    if not resume_text:
        return {
            "skills": [],
            "projects": [],
            "experience": [],
            "education": [],
            "certifications": [],
            "achievements": [],
            "technical_evidence": [],
            "development_evidence": [],
            "sections": {},
            "quality_signals": {},
        }

    # --------------------------------------------------------
    # Sections
    # --------------------------------------------------------

    sections = extract_sections(
        resume_text
    )

    # --------------------------------------------------------
    # Skills
    # --------------------------------------------------------

    skills = extract_skills(
        resume_text
    )

    # --------------------------------------------------------
    # Projects
    # --------------------------------------------------------

    projects = extract_projects(
        sections["projects"]
    )

    # --------------------------------------------------------
    # Education
    # --------------------------------------------------------

    education = extract_education(
        sections["education"]
    )

    # --------------------------------------------------------
    # Certifications
    # --------------------------------------------------------

    certifications = extract_certifications(
        sections["certifications"]
    )

    # --------------------------------------------------------
    # Technical evidence
    # --------------------------------------------------------

    technical_evidence = (
        extract_technical_evidence(
            resume_text
        )
    )

    # --------------------------------------------------------
    # Development evidence
    # --------------------------------------------------------

    development_evidence = (
        extract_development_evidence(
            resume_text
        )
    )

    # --------------------------------------------------------
    # Quality signals
    # --------------------------------------------------------

    quality_signals = (
        calculate_resume_quality_signals(
            sections
        )
    )

    quality_signals[
        "project_count"
    ] = len(projects)

    # --------------------------------------------------------
    # Final evidence object
    # --------------------------------------------------------

    return {
        "skills": skills,

        "projects": projects,

        "experience": sections[
            "experience"
        ],

        "education": education,

        "certifications": certifications,

        "achievements": sections[
            "achievements"
        ],

        "languages": sections[
            "languages"
        ],

        "technical_evidence": technical_evidence,

        "development_evidence": development_evidence,

        "sections": sections,

        "quality_signals": quality_signals,
    }