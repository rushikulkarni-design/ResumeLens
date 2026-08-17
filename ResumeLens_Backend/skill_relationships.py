# ============================================================
# SKILL RELATIONSHIPS
# ============================================================
#
# Match levels:
#
# 1. EXACT
#    The actual required skill appears in the resume.
#
# 2. STRONG RELATED
#    A legitimate alternative/variation of the skill.
#
# 3. CONTEXTUAL
#    Resume evidence suggests possible exposure,
#    but does NOT prove the exact skill.
#
# 4. MISSING
#    No reliable evidence found.
#
# IMPORTANT:
# We intentionally avoid broad mappings that can
# falsely increase ATS scores.
# ============================================================


# ============================================================
# STRONG RELATED TERMS
# ============================================================

RELATED_SKILLS = {

    # --------------------------------------------------------
    # REST API
    # --------------------------------------------------------

    "rest api": [
        "restful api",
        "restful apis",
        "rest apis",
        "rest api development",
    ],

    # --------------------------------------------------------
    # OOP
    # --------------------------------------------------------

    "oop": [
        "object oriented programming",
        "object-oriented programming",
        "object oriented",
        "object-oriented",
    ],

    # --------------------------------------------------------
    # DATA STRUCTURES
    # --------------------------------------------------------

    "data structures": [
        "data structure",
        "data structures and algorithms",
    ],

    # --------------------------------------------------------
    # ALGORITHMS
    # --------------------------------------------------------

    "algorithms": [
        "algorithm",
        "algorithmic problem solving",
        "algorithmic problem-solving",
    ],

    # --------------------------------------------------------
    # SQL
    # --------------------------------------------------------

    "sql": [
        "structured query language",
    ],

    # --------------------------------------------------------
    # JAVASCRIPT
    # --------------------------------------------------------

    "javascript": [
        "java script",
    ],

    # --------------------------------------------------------
    # TYPESCRIPT
    # --------------------------------------------------------

    "typescript": [
        "type script",
    ],

    # --------------------------------------------------------
    # C++
    # --------------------------------------------------------

    "c++": [
        "cpp",
        "c plus plus",
    ],

    # --------------------------------------------------------
    # C#
    # --------------------------------------------------------

    "c#": [
        "c sharp",
        "csharp",
    ],

    # --------------------------------------------------------
    # GIT
    # --------------------------------------------------------

    "git": [
        "git version control",
    ],

    # --------------------------------------------------------
    # GITHUB
    # --------------------------------------------------------

    "github": [
        "git hub",
    ],

    # --------------------------------------------------------
    # SDLC
    # --------------------------------------------------------

    "sdlc": [
        "software development life cycle",
        "software development lifecycle",
    ],

    # --------------------------------------------------------
    # AGILE
    # --------------------------------------------------------

    "agile": [
        "agile methodology",
        "agile development",
    ],

    # --------------------------------------------------------
    # UNIT TESTING
    # --------------------------------------------------------

    "unit testing": [
        "unit test",
        "unit tests",
    ],

    # --------------------------------------------------------
    # DOCKER
    # --------------------------------------------------------

    "docker": [
        "docker container",
        "docker containers",
    ],

    # --------------------------------------------------------
    # LINUX
    # --------------------------------------------------------

    "linux": [
        "linux operating system",
    ],

    # --------------------------------------------------------
    # PYTHON
    # --------------------------------------------------------

    "python": [
        "python programming",
    ],

    # --------------------------------------------------------
    # JAVA
    # --------------------------------------------------------

    "java": [
        "java programming",
    ],
}


# ============================================================
# CONTEXTUAL EVIDENCE
# ============================================================
#
# These mappings are intentionally narrow.
#
# They provide PARTIAL evidence only.
#
# They do NOT mean that the resume definitely contains
# the required skill.
# ============================================================

CONTEXTUAL_SKILLS = {

    # --------------------------------------------------------
    # ALGORITHMS
    # --------------------------------------------------------
    #
    # "Problem solving" can suggest algorithmic ability,
    # but does not prove algorithm knowledge.
    #

    "algorithms": [
        "problem solving",
        "problem-solving",
        "algorithmic problem solving",
        "algorithmic problem-solving",
    ],

    # --------------------------------------------------------
    # OOP
    # --------------------------------------------------------
    #
    # Only explicit object/class terminology is accepted.
    #

    "oop": [
        "classes and objects",
        "classes",
        "objects",
    ],

    # --------------------------------------------------------
    # SDLC
    # --------------------------------------------------------
    #
    # Software development experience can indicate
    # some exposure to the development lifecycle,
    # but does not prove SDLC knowledge.
    #

    "sdlc": [
        "software development process",
        "software development lifecycle",
    ],

    # --------------------------------------------------------
    # UNIT TESTING
    # --------------------------------------------------------
    #
    # Generic "testing" is weak evidence only.
    #

    "unit testing": [
        "software testing",
        "application testing",
    ],

    # --------------------------------------------------------
    # GIT
    # --------------------------------------------------------
    #
    # Version control is evidence of Git-like workflow,
    # but does not prove Git specifically.
    #

    "git": [
        "version control",
        "source control",
    ],

    # --------------------------------------------------------
    # AGILE
    # --------------------------------------------------------
    #
    # Only explicit Agile-related wording.
    #

    "agile": [
        "agile methodology",
        "agile development",
        "iterative development",
    ],

    # --------------------------------------------------------
    # LINUX
    # --------------------------------------------------------

    "linux": [
        "unix",
        "unix-based",
        "unix based",
    ],

    # --------------------------------------------------------
    # DOCKER
    # --------------------------------------------------------

    "docker": [
        "containerization",
        "containerization technology",
    ],

    # --------------------------------------------------------
    # SQL
    # --------------------------------------------------------
    #
    # Database experience alone does NOT prove SQL.
    # We therefore keep this very limited.
    #

    "sql": [
        "structured query language",
    ],
}


# ============================================================
# GET STRONG RELATED TERMS
# ============================================================

def get_related_terms(skill):
    """
    Return strong related terms for a required skill.
    """

    key = skill.strip().lower()

    return RELATED_SKILLS.get(
        key,
        [],
    )


# ============================================================
# GET CONTEXTUAL TERMS
# ============================================================

def get_contextual_terms(skill):
    """
    Return contextual evidence terms for a required skill.
    """

    key = skill.strip().lower()

    return CONTEXTUAL_SKILLS.get(
        key,
        [],
    )