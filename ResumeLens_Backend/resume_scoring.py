from role_profile import build_role_profile

from skill_relationships import (
    get_related_terms,
    get_contextual_terms,
)

# ============================================================
# SCORE WEIGHTS
# ============================================================

SCORE_WEIGHTS = {
    "technical_capability": 30,
    "project_evidence": 20,
    "role_relevance": 15,
    "technical_depth": 10,
    "resume_quality": 10,
    "education": 5,
    "certifications": 5,
    "role_skill_coverage": 5,
}

# ============================================================
# UTILITY
# ============================================================

def clamp(value, minimum=0, maximum=100):
    return max(
        minimum,
        min(
            maximum,
            value,
        ),
    )

# ============================================================
# SKILL EVIDENCE MATCH
# ============================================================

def calculate_skill_match_strength(
    resume_text,
    required_skill,
):
    """
    Determine how strongly a required skill is
    supported by the resume.

    Returns:

        1.00 = exact
        0.75 = strong related
        0.35 = contextual
        0.00 = missing
    """

    resume = str(
        resume_text
    ).lower()

    skill = str(
        required_skill
    ).strip().lower()

    if not skill:
        return 0.0

    # --------------------------------------------------------
    # EXACT
    # --------------------------------------------------------

    if skill in resume:
        return 1.0

    # --------------------------------------------------------
    # STRONG RELATED
    # --------------------------------------------------------

    for term in get_related_terms(
        required_skill
    ):

        if str(term).lower() in resume:
            return 0.75

    # --------------------------------------------------------
    # CONTEXTUAL
    # --------------------------------------------------------

    for term in get_contextual_terms(
        required_skill
    ):

        if str(term).lower() in resume:
            return 0.35

    # --------------------------------------------------------
    # MISSING
    # --------------------------------------------------------

    return 0.0

# ============================================================
# SKILL EVIDENCE SCORE
# ============================================================

def calculate_skill_evidence_score(
    resume_evidence,
    role_profile,
):
    """
    Calculate skill evidence using role competencies.

    The role's 18 reference skills are examples of the
    competency requirements, not a checklist that the
    candidate must completely satisfy.

    Skill evidence levels:

        Exact       = 1.00
        Related     = 0.75
        Contextual  = 0.35
        Missing     = 0.00

    Competencies are weighted by importance:

        Core        = 1.30
        Important   = 1.00
        Supporting  = 0.70
    """

    # --------------------------------------------------------
    # BUILD RESUME TEXT FOR MATCHING
    # --------------------------------------------------------

    resume_skill_text = " ".join(
        str(skill)
        for skill in resume_evidence.get(
            "skills",
            [],
        )
    )

    technical_text = " ".join(
        str(item)
        for item in resume_evidence.get(
            "technical_evidence",
            [],
        )
    )

    project_parts = []

    for project in resume_evidence.get(
        "projects",
        [],
    ):

        project_parts.append(
            str(
                project.get(
                    "title",
                    "",
                )
            )
        )

        project_parts.extend(
            str(description)
            for description in project.get(
                "description",
                [],
            )
        )

    project_text = " ".join(
        project_parts
    )

    education_text = " ".join(
        str(item)
        for item in resume_evidence.get(
            "education",
            [],
        )
    )

    certification_text = " ".join(
        str(item)
        for item in resume_evidence.get(
            "certifications",
            [],
        )
    )

    # --------------------------------------------------------
    # ROLE COMPETENCIES
    # --------------------------------------------------------

    competencies = role_profile.get(
        "competencies",
        {},
    )

    if not competencies:
        return 0

    # --------------------------------------------------------
    # IMPORTANCE WEIGHTS
    # --------------------------------------------------------

    importance_weights = {
        "core": 1.30,
        "important": 1.00,
        "supporting": 0.70,
    }

    total_weight = 0.0
    achieved_weight = 0.0

    # --------------------------------------------------------
    # EVALUATE EACH COMPETENCY
    # --------------------------------------------------------

    for category, competency in competencies.items():

        role_skills = competency.get(
            "skills",
            [],
        )

        importance = competency.get(
            "importance",
            "supporting",
        )

        if not role_skills:
            continue

        category_weight = importance_weights.get(
            importance,
            0.70,
        )

        total_weight += category_weight

        # ----------------------------------------------------
        # MATCH ROLE SKILLS AGAINST RESUME
        # ----------------------------------------------------

        skill_strengths = []

        for required_skill in role_skills:

            # ------------------------------------------------
            # SKILL SECTION
            # ------------------------------------------------

            skill_strength = calculate_skill_match_strength(
                resume_skill_text,
                required_skill,
            )

            # ------------------------------------------------
            # TECHNICAL EVIDENCE
            # ------------------------------------------------

            technical_strength = (
                calculate_skill_match_strength(
                    technical_text,
                    required_skill,
                )
            )

            # ------------------------------------------------
            # PROJECT EVIDENCE
            # ------------------------------------------------

            project_strength = (
                calculate_skill_match_strength(
                    project_text,
                    required_skill,
                )
            )

            # ------------------------------------------------
            # EDUCATION
            # ------------------------------------------------

            education_strength = (
                calculate_skill_match_strength(
                    education_text,
                    required_skill,
                )
            )

            # ------------------------------------------------
            # CERTIFICATION
            # ------------------------------------------------

            certification_strength = (
                calculate_skill_match_strength(
                    certification_text,
                    required_skill,
                )
            )

            # ------------------------------------------------
            # EVIDENCE PRIORITY
            # ------------------------------------------------

            # Direct resume skills are strongest.
            #
            # Technical evidence and projects are strong
            # practical evidence.
            #
            # Education/certifications support the claim
            # but should not dominate it.

            evidence_strength = max(
                skill_strength,
                technical_strength * 0.90,
                project_strength * 0.85,
                education_strength * 0.55,
                certification_strength * 0.65,
            )

            skill_strengths.append(
                evidence_strength
            )

        # ----------------------------------------------------
        # COMPETENCY EVIDENCE
        # ----------------------------------------------------

        if skill_strengths:

            strongest = max(
                skill_strengths
            )

            # Average the strongest evidence with the
            # overall skill coverage.
            #
            # This prevents one exact skill from automatically
            # making an entire competency perfect.

            positive_strengths = [
                strength
                for strength in skill_strengths
                if strength > 0
            ]

            if positive_strengths:

                average_strength = (
                    sum(
                        positive_strengths
                    )
                    /
                    len(
                        skill_strengths
                    )
                )

            else:

                average_strength = 0.0

            competency_score = (
                (strongest * 0.60)
                +
                (average_strength * 0.40)
            )

        else:

            competency_score = 0.0

        competency_score = min(
            1.0,
            competency_score,
        )

        achieved_weight += (
            competency_score
            *
            category_weight
        )

        # ----------------------------------------------------
        # DIAGNOSTIC
        # ----------------------------------------------------

        print(
            f"[SKILL EVIDENCE] "
            f"{category}: "
            f"{round(competency_score * 100)}% "
            f"| importance={importance} "
            f"| strongest={round(strongest * 100)}%"
        )

    # --------------------------------------------------------
    # FINAL SCORE
    # --------------------------------------------------------

    if total_weight == 0:
        return 0

    score = (
        achieved_weight
        /
        total_weight
    ) * 100

    return round(
        clamp(score)
    )

# ============================================================
# TECHNICAL CAPABILITY
# ============================================================

def calculate_technical_capability_score(
    resume_evidence,
):
    """
    Evaluate the candidate's demonstrated technical capability
    independently of the selected job's reference skills.

    This measures what the candidate actually demonstrates,
    rather than penalizing them for not having every skill
    in a role dataset.
    """

    skills = resume_evidence.get(
        "skills",
        [],
    )

    projects = resume_evidence.get(
        "projects",
        [],
    )

    technical_evidence = resume_evidence.get(
        "technical_evidence",
        [],
    )

    # --------------------------------------------------------
    # SKILL FOUNDATION
    # --------------------------------------------------------

    skill_count = len(
        skills
    )

    if skill_count == 0:
        skill_score = 0

    elif skill_count >= 12:
        skill_score = 90

    elif skill_count >= 10:
        skill_score = 82

    elif skill_count >= 8:
        skill_score = 72

    elif skill_count >= 6:
        skill_score = 62

    elif skill_count >= 4:
        skill_score = 50

    else:
        skill_score = 35

    # --------------------------------------------------------
    # PRACTICAL EVIDENCE
    # --------------------------------------------------------

    evidence_count = len(
        technical_evidence
    )

    if evidence_count >= 6:
        evidence_score = 100

    elif evidence_count >= 5:
        evidence_score = 90

    elif evidence_count >= 4:
        evidence_score = 80

    elif evidence_count >= 3:
        evidence_score = 70

    elif evidence_count >= 2:
        evidence_score = 55

    elif evidence_count == 1:
        evidence_score = 35

    else:
        evidence_score = 0

    # --------------------------------------------------------
    # PROJECT PRACTICALITY
    # --------------------------------------------------------

    project_count = len(
        projects
    )

    if project_count >= 3:
        project_score = 100

    elif project_count == 2:
        project_score = 90

    elif project_count == 1:
        project_score = 65

    else:
        project_score = 0

    # --------------------------------------------------------
    # COMBINE
    # --------------------------------------------------------

    score = (
        skill_score * 0.35
        +
        evidence_score * 0.35
        +
        project_score * 0.30
    )

    return round(
        clamp(score)
    )

# ============================================================
# PROJECT SCORE
# ============================================================

def calculate_project_score(
    resume_evidence,
):
    """
    Evaluate project quality and practical evidence.

    Projects are rewarded for:
    - number of projects
    - meaningful descriptions
    - technical evidence
    """

    projects = resume_evidence.get(
        "projects",
        [],
    )

    technical_evidence = resume_evidence.get(
        "technical_evidence",
        [],
    )

    if not projects:
        return 0

    score = 0

    # --------------------------------------------------------
    # PROJECT PRESENCE
    # --------------------------------------------------------

    project_count = len(projects)

    if project_count >= 1:
        score += 30

    if project_count >= 2:
        score += 15

    if project_count >= 3:
        score += 10

    # --------------------------------------------------------
    # PROJECT DESCRIPTION DEPTH
    # --------------------------------------------------------

    total_description_lines = 0

    for project in projects:

        descriptions = project.get(
            "description",
            [],
        )

        total_description_lines += len(
            descriptions
        )

    if total_description_lines >= 2:
        score += 10

    if total_description_lines >= 4:
        score += 10

    if total_description_lines >= 6:
        score += 10

    # --------------------------------------------------------
    # TECHNICAL EVIDENCE
    # --------------------------------------------------------

    if len(technical_evidence) >= 2:
        score += 5

    if len(technical_evidence) >= 4:
        score += 5

    return round(
        clamp(score)
    )

# ============================================================
# ROLE RELEVANCE
# ============================================================

def calculate_role_relevance_score(
    resume_text,
    job_title,
):
    """
    Evaluate how strongly the resume aligns with the
    selected role.

    Role relevance considers:

    1. Job title alignment
    2. Role terminology
    3. Competency breadth
    4. Practical development evidence

    This measures role fit, NOT overall technical capability.
    """

    text = resume_text.lower()
    role = job_title.lower().strip()

    score = 0

    # ========================================================
    # 1. TITLE ALIGNMENT — 25 POINTS
    # ========================================================

    if role in text:
        score += 25

    else:

        role_words = [
            word
            for word in role.split()
            if len(word) > 2
        ]

        if role_words:

            matched_role_words = sum(
                1
                for word in role_words
                if word in text
            )

            score += (
                matched_role_words
                /
                len(role_words)
            ) * 25

    # ========================================================
    # 2. ROLE-SPECIFIC TERMINOLOGY — 25 POINTS
    # ========================================================

    role_terms = {

        "software developer": [
            "programming",
            "software",
            "application",
            "development",
            "debugging",
            "data structures",
            "algorithms",
            "api",
            "problem solving",
        ],

        "software engineer": [
            "programming",
            "software",
            "engineering",
            "application",
            "development",
            "debugging",
            "data structures",
            "algorithms",
            "api",
        ],

    }

    terms = role_terms.get(
        role,
        role.split(),
    )

    if terms:

        matched_terms = sum(
            1
            for term in terms
            if term in text
        )

        terminology_score = (
            matched_terms
            /
            len(terms)
        ) * 25

        score += terminology_score

    # ========================================================
    # 3. COMPETENCY BREADTH — 35 POINTS
    # ========================================================
    #
    # Instead of requiring every individual skill,
    # determine how many competency areas are represented.
    #
    # Example Software Developer:
    #
    # programming_languages
    # core_development
    # backend_api
    # development_tools
    # testing_qa
    # databases
    #
    # This rewards breadth without turning the score
    # into another 18-skill checklist.
    # ========================================================

    competency_terms = {

        "programming_languages": [
            "python",
            "java",
            "c",
            "c++",
            "c#",
            "javascript",
            "typescript",
            "go",
            "rust",
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
            "kanban",
        ],

        "testing_qa": [
            "unit testing",
            "unit test",
            "testing",
            "selenium",
            "pytest",
            "quality assurance",
        ],
    }

    represented_competencies = 0

    for terms_in_group in competency_terms.values():

        if any(
            term in text
            for term in terms_in_group
        ):
            represented_competencies += 1

    total_competencies = len(
        competency_terms
    )

    if total_competencies:

        competency_score = (
            represented_competencies
            /
            total_competencies
        ) * 35

        score += competency_score

    # ========================================================
    # 4. PRACTICAL DEVELOPMENT EVIDENCE — 15 POINTS
    # ========================================================

    practical_terms = [
        "developed",
        "implemented",
        "designed",
        "built",
        "application",
        "project",
        "prototype",
        "automation",
        "api",
    ]

    practical_matches = sum(
        1
        for term in practical_terms
        if term in text
    )

    score += min(
        practical_matches * 1.5,
        15,
    )

    # ========================================================
    # FINAL CALIBRATION
    # ========================================================

    return round(
        clamp(score)
    )

# ============================================================
# TECHNICAL DEPTH
# ============================================================

def calculate_technical_depth_score(
    resume_evidence,
):
    """
    Evaluate breadth of technical evidence.
    """

    skills = resume_evidence.get(
        "skills",
        [],
    )

    technical_evidence = resume_evidence.get(
        "technical_evidence",
        [],
    )

    score = 0

    # Technical skill breadth

    score += min(
        len(skills) * 4,
        60,
    )

    # Practical technical evidence

    score += min(
        len(technical_evidence) * 8,
        40,
    )

    return round(
        clamp(score)
    )


# ============================================================
# EDUCATION
# ============================================================

def calculate_education_score(
    resume_evidence,
):
    """
    Evaluate educational background.

    Presence matters, but additional entries
    do not endlessly increase the score.
    """

    education = resume_evidence.get(
        "education",
        [],
    )

    if not education:
        return 0

    score = 60

    if len(education) >= 2:
        score += 20

    if len(education) >= 3:
        score += 10

    return round(
        clamp(score)
    )

# ============================================================
# CERTIFICATIONS
# ============================================================

def calculate_certification_score(
    resume_evidence,
):
    """
    Evaluate certification strength.

    More certifications help, but the score
    saturates gradually rather than immediately
    becoming 100.
    """

    certifications = resume_evidence.get(
        "certifications",
        [],
    )

    if not certifications:
        return 0

    count = len(certifications)

    if count == 1:
        return 35

    if count == 2:
        return 50

    if count == 3:
        return 65

    if count == 4:
        return 72

    if count == 5:
        return 78

    if count == 6:
        return 83

    if count == 7:
        return 87

    if count == 8:
        return 90

    return 92

# ============================================================
# RESUME QUALITY
# ============================================================

def calculate_resume_quality_score(
    resume_evidence,
):
    signals = resume_evidence.get(
        "quality_signals",
        {},
    )

    score = 0

    if signals.get(
        "has_skills_section"
    ):
        score += 15

    if signals.get(
        "has_projects_section"
    ):
        score += 15

    if signals.get(
        "has_experience_section"
    ):
        score += 15

    if signals.get(
        "has_education_section"
    ):
        score += 15

    if signals.get(
        "has_certifications_section"
    ):
        score += 10

    if signals.get(
        "project_count",
        0,
    ) >= 1:
        score += 10

    if signals.get(
        "project_count",
        0,
    ) >= 2:
        score += 10

    if signals.get(
        "certification_count",
        0,
    ) >= 3:
        score += 10

    return round(
        clamp(score)
    )


# ============================================================
# FINAL SCORE
# ============================================================

def calculate_resume_score(
    resume_text,
    resume_evidence,
    job_title,
):
    """
    Calculate the holistic resume score using
    candidate capability plus role-specific coverage.
    """

    role_profile = build_role_profile(
        job_title
    )

    skill_score = calculate_skill_evidence_score(
        resume_evidence,
        role_profile,
    )

    technical_capability_score = ( calculate_technical_capability_score(
        resume_evidence)
    )

    project_score = calculate_project_score(
        resume_evidence,
    )

    relevance_score = calculate_role_relevance_score(
        resume_text,
        job_title,
    )

    technical_score = calculate_technical_depth_score(
        resume_evidence,
    )

    education_score = calculate_education_score(
        resume_evidence,
    )

    certification_score = calculate_certification_score(
        resume_evidence,
    )

    quality_score = calculate_resume_quality_score(
        resume_evidence,
    )

    final_score = (

    technical_capability_score
    * SCORE_WEIGHTS["technical_capability"]
    / 100

    +

    project_score
    * SCORE_WEIGHTS["project_evidence"]
    / 100

    +

    relevance_score
    * SCORE_WEIGHTS["role_relevance"]
    / 100

    +

    technical_score
    * SCORE_WEIGHTS["technical_depth"]
    / 100

    +

    quality_score
    * SCORE_WEIGHTS["resume_quality"]
    / 100

    +

    education_score
    * SCORE_WEIGHTS["education"]
    / 100

    +

    certification_score
    * SCORE_WEIGHTS["certifications"]
    / 100

    +

    skill_score
    * SCORE_WEIGHTS["role_skill_coverage"]
    / 100
    )
    

    return {
        "final_score": round(
            clamp(final_score)
        ),

        "component_scores": {
            "technical_capability": technical_capability_score,
            "role_skill_coverage": skill_score,
            "project_evidence": project_score,
            "role_relevance": relevance_score,
            "technical_depth": technical_score,
            "education": education_score,
            "certifications": certification_score,
            "resume_quality": quality_score,
        },

        "weights": SCORE_WEIGHTS,

        "role_profile": role_profile,
    }