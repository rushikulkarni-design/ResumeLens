import os
import csv


# ============================================================
# ROLE DATASET LOCATION
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

JOB_DATASETS_DIR = os.path.join(
    BASE_DIR,
    "job_datasets",
)


# ============================================================
# SKILL CATEGORY RULES
# ============================================================

CATEGORY_RULES = {

    "programming_languages": [
        "python",
        "java",
        "c",
        "c++",
        "c#",
        "javascript",
        "typescript",
        "go",
        "golang",
        "rust",
        "php",
        "ruby",
        "kotlin",
        "swift",
    ],

    "core_development": [
        "data structures",
        "algorithms",
        "oop",
        "object oriented programming",
        "programming fundamentals",
        "problem solving",
    ],

    "databases": [
        "sql",
        "mysql",
        "postgresql",
        "mongodb",
        "oracle",
        "database",
        "databases",
    ],

    "backend_api": [
        "rest api",
        "restful api",
        "api",
        "apis",
        "web services",
    ],

    "development_tools": [
        "git",
        "github",
        "gitlab",
        "docker",
        "jenkins",
    ],

    "devops_infrastructure": [
        "linux",
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "gcp",
        "cloud",
    ],

    "development_practices": [
        "agile",
        "scrum",
        "sdlc",
        "software development lifecycle",
        "kanban",
    ],

    "testing_qa": [
        "unit testing",
        "unit test",
        "testing",
        "automation testing",
        "selenium",
        "pytest",
        "quality assurance",
    ],

    "data_ai": [
        "machine learning",
        "deep learning",
        "artificial intelligence",
        "natural language processing",
        "computer vision",
        "data science",
        "statistics",
        "pandas",
        "numpy",
    ],

    "frontend": [
        "html",
        "css",
        "javascript",
        "typescript",
        "react",
        "angular",
        "vue",
    ],

    "mobile": [
        "android",
        "ios",
        "kotlin",
        "swift",
        "flutter",
        "react native",
    ],

    "security": [
        "cybersecurity",
        "security",
        "penetration testing",
        "ethical hacking",
        "network security",
        "information security",
        "soc",
    ],
}


# ============================================================
# LOAD CSV SKILLS
# ============================================================

def load_job_skills(
    job_title: str,
):
    """
    Find the CSV associated with the selected job
    and return its skills.

    The existing 50 CSV datasets contain one skill
    per line.
    """

    if not job_title:
        return []

    target = job_title.strip().lower()

    for filename in os.listdir(
        JOB_DATASETS_DIR
    ):

        if not filename.lower().endswith(
            ".csv"
        ):
            continue

        # Remove numeric prefix
        # Example:
        # 02_Software_Developer.csv
        # becomes:
        # software_developer
        name = os.path.splitext(
            filename
        )[0]

        # Remove the numeric dataset prefix.
        # Example:
        # 02_Software_Developer
        # -> Software_Developer
        #
        # 10_.NET_Developer
        # -> .NET_Developer

        if "_" in name:

            prefix, remaining = name.split(
                "_",
                1
            )

            if prefix.isdigit():
                name = remaining

        normalized_name = (
            name.replace("_", " ")
            .replace("-", " ")
            .strip()
            .lower()
        )

        # Handle .NET specifically
        normalized_name = (
            normalized_name
            .replace(".net", "net")
        )

        target_normalized = (
            target
            .replace(".net", "net")
        )

        if normalized_name == target_normalized:

            path = os.path.join(
                JOB_DATASETS_DIR,
                filename,
            )

            skills = []

            with open(
                path,
                "r",
                encoding="utf-8-sig",
            ) as csv_file:

                reader = csv.reader(
                    csv_file
                )

                for row in reader:

                    if not row:
                        continue

                    skill = row[0].strip()

                    if skill:
                        skills.append(
                            skill
                        )

            return skills

    return []


# ============================================================
# CLASSIFY ONE SKILL
# ============================================================

def classify_skill(
    skill: str,
):
    """
    Determine the competency category
    of a role skill.
    """

    normalized = (
        skill.strip()
        .lower()
    )

    # --------------------------------------------------------
    # Exact category match
    # --------------------------------------------------------

    for category, terms in CATEGORY_RULES.items():

        for term in terms:

            if normalized == term:
                return category

    # --------------------------------------------------------
    # Phrase containment
    # --------------------------------------------------------

    for category, terms in CATEGORY_RULES.items():

        for term in terms:

            if term in normalized:
                return category

    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    return "other"


# ============================================================
# BUILD ROLE COMPETENCIES
# ============================================================

def build_role_competencies(
    skills,
):
    """
    Organize role skills into competency groups.

    Every skill is retained.
    Nothing is removed simply because it
    does not fit a known category.
    """

    competencies = {}

    for skill in skills:

        category = classify_skill(
            skill
        )

        if category not in competencies:
            competencies[category] = []

        competencies[category].append(
            skill
        )

    return competencies


# ============================================================
# ASSIGN COMPETENCY IMPORTANCE
# ============================================================

def assign_competency_importance(
    competencies,
):
    """
    Assign a general importance level to each
    competency category.

    This is NOT the final ATS score.

    It only tells the future scoring engine
    which categories are more central to a role.
    """

    importance_rules = {

        "programming_languages": "core",

        "core_development": "core",

        "databases": "supporting",

        "backend_api": "important",

        "development_tools": "important",

        "devops_infrastructure": "supporting",

        "development_practices": "supporting",

        "testing_qa": "important",

        "data_ai": "important",

        "frontend": "important",

        "mobile": "important",

        "security": "important",

        "other": "supporting",
    }

    result = {}

    for category, skills in competencies.items():

        importance = importance_rules.get(
            category,
            "supporting",
        )

        result[category] = {
            "importance": importance,
            "skills": skills,
            "skill_count": len(skills),
        }

    return result


# ============================================================
# BUILD ROLE PROFILE
# ============================================================

def build_role_profile(
    job_title: str,
):
    """
    Build the complete role profile for
    the selected job.
    """

    skills = load_job_skills(
        job_title
    )

    competencies = build_role_competencies(
        skills
    )

    competency_profile = (
        assign_competency_importance(
            competencies
        )
    )

    return {
        "job_title": job_title,

        "skills": skills,

        "total_skills": len(skills),

        "competencies": competency_profile,
    }