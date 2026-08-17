from resume_evidence import extract_resume_evidence
from resume_scoring import calculate_resume_score


# ============================================================
# TEST RESUME
# ============================================================

resume_text = """
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

Solar Power Awareness & Investment Estimator

Developed an informative web application focused on making
solar-energy information accessible.

Implemented a custom investment-estimator calculator to
support user-side decision making through application logic.

Automatic Door Opening & Closing System

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
# EXTRACT EVIDENCE
# ============================================================

evidence = extract_resume_evidence(
    resume_text
)


# ============================================================
# CALCULATE SCORE
# ============================================================

result = calculate_resume_score(
    resume_text=resume_text,
    resume_evidence=evidence,
    job_title="Software Developer",
)


# ============================================================
# DISPLAY RESULT
# ============================================================

print("\n================================")
print("NEW RESUME SCORE")
print("================================")

print(
    "Final Score:",
    result["final_score"],
)


print("\nComponent Scores:")

for component, score in result[
    "component_scores"
].items():

    print(
        f"{component}: {score}"
    )


print("\nWeights:")

for component, weight in result[
    "weights"
].items():

    print(
        f"{component}: {weight}%"
    )


print("\n================================")