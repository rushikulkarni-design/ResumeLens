import re

from skill_relationships import (
    get_related_terms,
    get_contextual_terms,
)


# ============================================================
# BUILT-IN CONTEXTUAL HINTS
# ============================================================
#
# These are conservative hints for cases where a resume
# demonstrates a concept without using the exact dataset term.
#
# IMPORTANT:
# These are CONTEXTUAL matches only.
# They receive 0.25 weight.
#
# We do NOT treat related technologies as equivalent.
#
# Example:
#
# REST API
#   "APIs" -> contextual
#
# C++
#   "C" -> NOT contextual
#
# JavaScript
#   "Java" -> NOT contextual
#
# ============================================================

BUILT_IN_CONTEXTUAL_HINTS = {

    "rest api": [
        "apis",
        "api",
        "restful",
        "restful api",
        "restful apis",
        "web api",
        "web apis",
        "web services",
        "service api",
    ],

    "algorithms": [
        "algorithmic",
        "algorithmic problem solving",
        "algorithm design",
        "problem solving",
        "problem-solving",
    ],

    "oop": [
        "object oriented",
        "object-oriented",
        "object oriented programming",
        "object-oriented programming",
        "classes",
        "inheritance",
        "encapsulation",
        "polymorphism",
    ],

    "software development": [
        "software developer",
        "software development",
        "application development",
        "web application development",
        "application logic",
    ],

    "unit testing": [
        "unit tests",
        "unit test",
        "automated unit tests",
    ],

    "sdlc": [
        "software development lifecycle",
        "software development life cycle",
    ],

    "sdlc": [
        "software development lifecycle",
        "software development life cycle",
    ],

    "git": [
        "version control",
        "source control",
    ],

    "github": [
        "github repository",
        "github repositories",
        "github profile",
    ],

    "sql": [
        "relational database",
        "relational databases",
        "database queries",
        "database query",
    ],

    "docker": [
        "containerization",
        "containerized",
        "containers",
    ],

    "linux": [
        "linux environment",
        "linux systems",
        "unix",
    ],

    "agile": [
        "agile methodology",
        "agile development",
        "scrum",
        "kanban",
    ],

    "javascript": [
        "js",
        "javascript development",
    ],

    "typescript": [
        "ts",
        "typescript development",
    ],
}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text):
    """
    Normalize text so harmless formatting differences
    do not prevent skill matching.
    """

    if not text:
        return ""

    text = str(text).lower()

    # Normalize common separators
    text = text.replace("/", " ")
    text = text.replace("-", " ")
    text = text.replace("_", " ")

    # Keep:
    # letters
    # numbers
    # +
    # #
    # spaces
    text = re.sub(
        r"[^a-z0-9+#\s]",
        " ",
        text,
    )

    # Collapse whitespace
    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


# ============================================================
# TERM FOUND
# ============================================================

def term_found(
    resume_text,
    term,
):
    """
    Check whether a term appears in the resume.

    Uses word-aware matching where possible so that
    short terms do not accidentally match unrelated words.
    """

    resume = normalize_text(
        resume_text
    )

    normalized_term = normalize_text(
        term
    )

    if not normalized_term:
        return False

    if not resume:
        return False

    # --------------------------------------------------------
    # Multi-word terms
    # --------------------------------------------------------

    if " " in normalized_term:

        return normalized_term in resume

    # --------------------------------------------------------
    # Technical terms containing + or #
    #
    # Examples:
    # C++
    # C#
    # .NET after normalization
    # --------------------------------------------------------

    if "+" in normalized_term or "#" in normalized_term:

        return normalized_term in resume

    # --------------------------------------------------------
    # Normal single-word terms
    # --------------------------------------------------------

    pattern = (
        r"(?<![a-z0-9])"
        + re.escape(normalized_term)
        + r"(?![a-z0-9])"
    )

    return re.search(
        pattern,
        resume,
    ) is not None


# ============================================================
# EXACT SKILL MATCH
# ============================================================

def exact_skill_found(
    resume_text,
    required_skill,
):
    """
    Check whether the actual required skill
    appears in the resume.
    """

    return term_found(
        resume_text,
        required_skill,
    )


# ============================================================
# STRONG RELATED MATCH
# ============================================================

def related_skill_found(
    resume_text,
    required_skill,
):
    """
    Check whether a strong/equivalent variation
    of the required skill appears.
    """

    related_terms = get_related_terms(
        required_skill
    )

    if not related_terms:
        return False

    for term in related_terms:

        if term_found(
            resume_text,
            term,
        ):
            return True

    return False


# ============================================================
# BUILT-IN CONTEXTUAL TERMS
# ============================================================

def get_builtin_contextual_terms(
    required_skill,
):
    """
    Return conservative built-in contextual
    terms for a required skill.
    """

    normalized_skill = normalize_text(
        required_skill
    )

    return BUILT_IN_CONTEXTUAL_HINTS.get(
        normalized_skill,
        [],
    )


# ============================================================
# CONTEXTUAL MATCH
# ============================================================

def contextual_skill_found(
    resume_text,
    required_skill,
):
    """
    Check whether contextual evidence for the
    required skill appears in the resume.

    Contextual evidence receives 0.25 weight.
    """

    # --------------------------------------------------------
    # 1. Existing contextual relationships
    # --------------------------------------------------------

    contextual_terms = get_contextual_terms(
        required_skill
    )

    for term in contextual_terms:

        if term_found(
            resume_text,
            term,
        ):
            return True

    # --------------------------------------------------------
    # 2. Built-in conservative contextual hints
    # --------------------------------------------------------

    builtin_terms = (
        get_builtin_contextual_terms(
            required_skill
        )
    )

    for term in builtin_terms:

        if term_found(
            resume_text,
            term,
        ):
            return True

    return False


# ============================================================
# CALCULATE ATS SCORE
# ============================================================

def calculate_ats_score(
    resume_text,
    required_skills,
):
    """
    Calculate a job-specific ATS score.

    Match weights:

        Exact       = 1.00
        Related     = 0.50
        Contextual  = 0.25
        Missing     = 0.00

    Returns:

        score
        exact_matches
        related_matches
        contextual_matches
        missing_skills
    """

    if not required_skills:

        return (
            0,
            [],
            [],
            [],
            [],
        )

    exact_matches = []
    related_matches = []
    contextual_matches = []
    missing_skills = []

    # ========================================================
    # CHECK EVERY REQUIRED SKILL
    # ========================================================

    for skill in required_skills:

        skill = skill.strip()

        if not skill:
            continue

        # ----------------------------------------------------
        # 1. EXACT MATCH
        # ----------------------------------------------------

        if exact_skill_found(
            resume_text,
            skill,
        ):

            exact_matches.append(
                skill
            )

            continue

        # ----------------------------------------------------
        # 2. STRONG RELATED MATCH
        # ----------------------------------------------------

        if related_skill_found(
            resume_text,
            skill,
        ):

            related_matches.append(
                skill
            )

            continue

        # ----------------------------------------------------
        # 3. CONTEXTUAL MATCH
        # ----------------------------------------------------

        if contextual_skill_found(
            resume_text,
            skill,
        ):

            contextual_matches.append(
                skill
            )

            continue

        # ----------------------------------------------------
        # 4. MISSING
        # ----------------------------------------------------

        missing_skills.append(
            skill
        )

    # ========================================================
    # SCORE
    # ========================================================

    total_skills = len(
        required_skills
    )

    if total_skills == 0:

        return (
            0,
            exact_matches,
            related_matches,
            contextual_matches,
            missing_skills,
        )

    # Exact = 100%
    # Related = 50%
    # Contextual = 25%

    weighted_matches = (
        len(exact_matches)
        +
        (
            len(related_matches)
            * 0.50
        )
        +
        (
            len(contextual_matches)
            * 0.25
        )
    )

    score = int(
        (
            weighted_matches
            /
            total_skills
        )
        * 100
    )

    return (
        score,
        exact_matches,
        related_matches,
        contextual_matches,
        missing_skills,
    )