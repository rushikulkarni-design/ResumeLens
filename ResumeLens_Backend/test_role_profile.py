from role_profile import build_role_profile


# ============================================================
# TEST ALL 50 JOB ROLES
# ============================================================

job_titles = [
    "Software Engineer",
    "Software Developer",
    "Full Stack Developer",
    "Front End Developer",
    "Back End Developer",
    "Web Developer",
    "Mobile App Developer",
    "Python Developer",
    "Java Developer",
    ".NET Developer",
    "Data Analyst",
    "Data Scientist",
    "Data Engineer",
    "Business Intelligence BI Analyst",
    "BI Developer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Deep Learning Engineer",
    "NLP Engineer",
    "Computer Vision Engineer",
    "Generative AI Engineer",
    "AI ML Research Scientist",
    "MLOps Engineer",
    "Big Data Engineer",
    "Database Administrator DBA",
    "Cloud Engineer",
    "Cloud Architect",
    "DevOps Engineer",
    "Site Reliability Engineer SRE",
    "Platform Engineer",
    "Solutions Architect",
    "System Administrator",
    "Network Engineer",
    "Network Administrator",
    "Cybersecurity Analyst",
    "Cybersecurity Engineer",
    "Security Engineer",
    "Ethical Hacker Penetration Tester",
    "Security Operations Center SOC Analyst",
    "Cloud Security Engineer",
    "Information Security Analyst",
    "QA Engineer",
    "Software Test Engineer",
    "Automation Test Engineer",
    "Technical Support Engineer",
    "IT Support Specialist",
    "IT Project Manager",
    "Product Manager Technology",
    "Business Analyst IT",
    "IT Consultant",
]


# ============================================================
# RUN TEST
# ============================================================

successful = 0
failed = 0


print("\n================================")
print("50 JOB ROLE VALIDATION")
print("================================")


for job_title in job_titles:

    try:

        profile = build_role_profile(
            job_title
        )

        total_skills = profile[
            "total_skills"
        ]

        competencies = profile[
            "competencies"
        ]

        if total_skills == 0:

            failed += 1

            print(
                f"❌ {job_title}: "
                f"NO SKILLS FOUND"
            )

            continue

        successful += 1

        print(
            f"✅ {job_title}: "
            f"{total_skills} skills | "
            f"{len(competencies)} competencies"
        )

    except Exception as e:

        failed += 1

        print(
            f"❌ {job_title}: "
            f"{e}"
        )


# ============================================================
# SUMMARY
# ============================================================

print("\n================================")
print("VALIDATION SUMMARY")
print("================================")

print(
    "Successful:",
    successful,
)

print(
    "Failed:",
    failed,
)

print(
    "Total:",
    len(job_titles),
)

print("================================")