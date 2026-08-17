import pdfplumber

from resume_evidence import extract_resume_evidence

from resume_scoring import (
    calculate_resume_score,
    calculate_technical_capability_score,
)


PDF_PATH = "Rushi_Kulkarni_Software_Developer_Resume.pdf"
JOB_TITLE = "Software Developer"


# ============================================================
# EXTRACT REAL PDF TEXT
# ============================================================

text = ""

with pdfplumber.open(PDF_PATH) as pdf:

    for page in pdf.pages:

        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"


if not text.strip():

    raise RuntimeError(
        "No text could be extracted from the resume PDF."
    )


# ============================================================
# EXTRACT REAL RESUME EVIDENCE
# ============================================================

evidence = extract_resume_evidence(
    text
)


# ============================================================
# TECHNICAL CAPABILITY
# ============================================================

technical_capability = (
    calculate_technical_capability_score(
        evidence
    )
)


print()
print("================================")
print("TECHNICAL CAPABILITY")
print("================================")

print(
    f"Score: {technical_capability}"
)


# ============================================================
# REAL RESUME EVIDENCE
# ============================================================

print()
print("================================")
print("REAL RESUME EVIDENCE")
print("================================")

print(
    "Skills:",
    len(
        evidence.get(
            "skills",
            [],
        )
    ),
)

print(
    "Projects:",
    len(
        evidence.get(
            "projects",
            [],
        )
    ),
)

print(
    "Technical Evidence:",
    len(
        evidence.get(
            "technical_evidence",
            [],
        )
    ),
)

print(
    "Education:",
    len(
        evidence.get(
            "education",
            [],
        )
    ),
)

print(
    "Certifications:",
    len(
        evidence.get(
            "certifications",
            [],
        )
    ),
)


# ============================================================
# DEBUG EVIDENCE
# ============================================================

print()
print("================================")
print("EVIDENCE DETAILS")
print("================================")

print(
    "Projects:",
    evidence.get(
        "projects",
        [],
    ),
)

print(
    "Technical Evidence:",
    evidence.get(
        "technical_evidence",
        [],
    ),
)


# ============================================================
# CALCULATE RESUME SCORE
# ============================================================

result = calculate_resume_score(
    resume_text=text,
    resume_evidence=evidence,
    job_title=JOB_TITLE,
)


# ============================================================
# FINAL SCORE
# ============================================================

final_score = result.get(
    "final_score",
    0,
)


print()
print("================================")
print("REAL RESUME SCORE")
print("================================")

print(
    "Final Score:",
    final_score,
)


# ============================================================
# COMPONENT SCORES
# ============================================================

print()
print("Component Scores:")

component_scores = result.get(
    "component_scores",
    {},
)

for component, score in component_scores.items():

    print(
        f"{component}: {score}"
    )


# ============================================================
# SCORE WEIGHTS
# ============================================================

weights = result.get(
    "weights",
    {},
)

if weights:

    print()
    print("Weights:")

    for component, weight in weights.items():

        print(
            f"{component}: {weight}%"
        )


# ============================================================
# VALIDATION
# ============================================================

print()
print("================================")
print("SCORING VALIDATION")
print("================================")


# Final score must be within the expected range.

if not 0 <= final_score <= 100:

    raise AssertionError(
        f"Invalid final score: {final_score}"
    )


# Technical capability must be within range.

if not 0 <= technical_capability <= 100:

    raise AssertionError(
        "Invalid technical capability score."
    )


# Every component score must be valid.

for component, score in component_scores.items():

    if not 0 <= score <= 100:

        raise AssertionError(
            f"Invalid score for {component}: {score}"
        )


# If weights exist, they should sum to approximately 100.

if weights:

    weight_total = sum(
        float(weight)
        for weight in weights.values()
    )

    if abs(weight_total - 100) > 0.01:

        raise AssertionError(
            f"Score weights do not total 100%. "
            f"Total: {weight_total}"
        )


print(
    "✓ Final score is valid"
)

print(
    "✓ Technical capability score is valid"
)

print(
    "✓ Component scores are valid"
)

if weights:

    print(
        "✓ Score weights total 100%"
    )


# ============================================================
# EVIDENCE VALIDATION
# ============================================================

print()
print("================================")
print("EVIDENCE VALIDATION")
print("================================")

required_evidence_keys = [
    "skills",
    "projects",
    "technical_evidence",
    "education",
    "certifications",
]


for key in required_evidence_keys:

    if key not in evidence:

        raise AssertionError(
            f"Missing evidence field: {key}"
        )


print(
    "✓ Resume evidence structure is valid"
)

print(
    "✓ Required evidence fields are present"
)


# ============================================================
# FINAL RESULT
# ============================================================

print()
print("================================")
print("STEP 68 VALIDATION COMPLETE")
print("================================")

print(
    f"Resume: {PDF_PATH}"
)

print(
    f"Role: {JOB_TITLE}"
)

print(
    f"Final Score: {final_score}/100"
)

print(
    f"Technical Capability: "
    f"{technical_capability}/100"
)

print(
    "Scoring pipeline is working successfully."
)

print("================================")