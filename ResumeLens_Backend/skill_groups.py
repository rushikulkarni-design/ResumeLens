# ============================================================
# JOB-AWARE SKILL GROUPS
# ============================================================
#
# This file classifies skills into broad technical categories.
#
# The categories are intentionally generic so they can work
# across all 50 job datasets.
#
# IMPORTANT:
# This does NOT change the ATS score.
# It is only used for skill-group analysis.
# ============================================================


SKILL_GROUPS = {

    # ========================================================
    # PROGRAMMING
    # ========================================================

    "programming_languages": [
        "Python",
        "Java",
        "C",
        "C++",
        "C#",
        "JavaScript",
        "TypeScript",
        "PHP",
        "Ruby",
        "Go",
        "Golang",
        "Rust",
        "Kotlin",
        "Swift",
        "Scala",
        "R",
        "MATLAB",
        "Dart",
        "Perl",
        "Shell",
        "Bash",
        "PowerShell",
    ],


    # ========================================================
    # CORE SOFTWARE DEVELOPMENT
    # ========================================================

    "core_development": [
        "Data Structures",
        "Algorithms",
        "OOP",
        "Object Oriented Programming",
        "Software Development",
        "Software Engineering",
        "System Design",
        "Design Patterns",
        "Problem Solving",
    ],


    # ========================================================
    # WEB / FRONTEND
    # ========================================================

    "web_frontend": [
        "HTML",
        "CSS",
        "JavaScript",
        "TypeScript",
        "React",
        "React.js",
        "Angular",
        "Vue",
        "Vue.js",
        "Next.js",
        "Bootstrap",
        "Tailwind CSS",
        "Frontend Development",
        "Web Development",
        "UI Development",
    ],


    # ========================================================
    # BACKEND / APIS
    # ========================================================

    "backend_api": [
        "REST API",
        "REST APIs",
        "RESTful API",
        "REST",
        "GraphQL",
        "API Development",
        "Backend Development",
        "Microservices",
        "Node.js",
        "Express.js",
        "Django",
        "Flask",
        "Spring",
        "Spring Boot",
        ".NET",
        "ASP.NET",
    ],


    # ========================================================
    # DATABASES
    # ========================================================

    "databases": [
        "SQL",
        "MySQL",
        "PostgreSQL",
        "Oracle",
        "SQL Server",
        "MongoDB",
        "Redis",
        "Cassandra",
        "NoSQL",
        "Database",
        "Database Management",
        "Data Modeling",
    ],


    # ========================================================
    # DATA / ANALYTICS
    # ========================================================

    "data_analytics": [
        "Data Analysis",
        "Data Analytics",
        "Statistics",
        "Data Visualization",
        "Power BI",
        "Tableau",
        "Excel",
        "Business Intelligence",
        "BI",
        "Pandas",
        "NumPy",
        "Matplotlib",
        "Seaborn",
    ],


    # ========================================================
    # MACHINE LEARNING / AI
    # ========================================================

    "ai_machine_learning": [
        "Machine Learning",
        "Deep Learning",
        "Artificial Intelligence",
        "AI",
        "Natural Language Processing",
        "NLP",
        "Computer Vision",
        "Generative AI",
        "Large Language Models",
        "LLM",
        "TensorFlow",
        "PyTorch",
        "Scikit-learn",
        "Keras",
        "Transformers",
        "Neural Networks",
    ],


    # ========================================================
    # CLOUD
    # ========================================================

    "cloud": [
        "AWS",
        "Amazon Web Services",
        "Azure",
        "Microsoft Azure",
        "Google Cloud",
        "GCP",
        "Cloud Computing",
        "Cloud Architecture",
        "Cloud Services",
        "Cloud Infrastructure",
    ],


    # ========================================================
    # DEVOPS / INFRASTRUCTURE
    # ========================================================

    "devops_infrastructure": [
        "Docker",
        "Kubernetes",
        "Jenkins",
        "Terraform",
        "Ansible",
        "CI/CD",
        "Continuous Integration",
        "Continuous Deployment",
        "DevOps",
        "Infrastructure as Code",
        "IaC",
        "Linux",
        "Unix",
        "Virtualization",
    ],


    # ========================================================
    # VERSION CONTROL / DEVELOPMENT TOOLS
    # ========================================================

    "development_tools": [
        "Git",
        "GitHub",
        "GitLab",
        "Bitbucket",
        "Version Control",
        "Source Control",
        "VS Code",
        "Visual Studio",
        "IntelliJ IDEA",
        "Eclipse",
    ],


    # ========================================================
    # TESTING / QA
    # ========================================================

    "testing_qa": [
        "Unit Testing",
        "Integration Testing",
        "Software Testing",
        "Manual Testing",
        "Automation Testing",
        "Test Automation",
        "Selenium",
        "Cypress",
        "JUnit",
        "PyTest",
        "TestNG",
        "Quality Assurance",
        "QA",
        "API Testing",
        "Performance Testing",
    ],


    # ========================================================
    # CYBERSECURITY
    # ========================================================

    "cybersecurity": [
        "Cybersecurity",
        "Information Security",
        "Network Security",
        "Application Security",
        "Cloud Security",
        "Ethical Hacking",
        "Penetration Testing",
        "Vulnerability Assessment",
        "SIEM",
        "SOC",
        "Incident Response",
        "Threat Detection",
        "Digital Forensics",
        "Cryptography",
        "IAM",
        "Identity and Access Management",
    ],


    # ========================================================
    # NETWORKING
    # ========================================================

    "networking": [
        "Networking",
        "Computer Networks",
        "TCP/IP",
        "TCP",
        "UDP",
        "DNS",
        "DHCP",
        "HTTP",
        "HTTPS",
        "Routing",
        "Switching",
        "VPN",
        "Firewall",
        "Network Administration",
    ],


    # ========================================================
    # OPERATING SYSTEMS
    # ========================================================

    "operating_systems": [
        "Linux",
        "Unix",
        "Windows",
        "Windows Server",
        "Operating Systems",
        "System Administration",
    ],


    # ========================================================
    # PROJECT / DEVELOPMENT PRACTICES
    # ========================================================

    "development_practices": [
        "Agile",
        "Scrum",
        "SDLC",
        "Software Development Life Cycle",
        "Software Development Lifecycle",
        "Kanban",
        "Project Management",
        "Jira",
        "Confluence",
        "Unit Testing",
        "Code Review",
        "Documentation",
    ],


    # ========================================================
    # BUSINESS / PRODUCT
    # ========================================================

    "business_product": [
        "Business Analysis",
        "Business Intelligence",
        "Product Management",
        "Product Strategy",
        "Requirements Gathering",
        "Requirements Analysis",
        "Stakeholder Management",
        "Market Research",
        "Roadmapping",
        "User Stories",
        "KPIs",
    ],


    # ========================================================
    # SUPPORT / IT OPERATIONS
    # ========================================================

    "it_support_operations": [
        "Technical Support",
        "IT Support",
        "Help Desk",
        "Troubleshooting",
        "IT Operations",
        "System Administration",
        "Active Directory",
        "ServiceNow",
        "ITIL",
    ],
}


# ============================================================
# NORMALIZE SKILL
# ============================================================

def normalize_skill(skill):
    """
    Normalize a skill for comparison.
    """

    return skill.strip().lower()


# ============================================================
# GET GROUP FOR A SKILL
# ============================================================

def get_skill_group(skill):
    """
    Return the first matching group for a skill.

    Returns None when the skill has not yet been
    classified.
    """

    normalized = normalize_skill(skill)

    for group_name, skills in SKILL_GROUPS.items():

        for item in skills:

            if normalize_skill(item) == normalized:

                return group_name

    return None


# ============================================================
# GET GROUPS FOR SELECTED JOB
# ============================================================

def get_groups_for_skills(required_skills):
    """
    Return only the groups that are represented
    in the selected job's required skills.
    """

    groups = {}

    for skill in required_skills:

        group_name = get_skill_group(skill)

        if not group_name:
            continue

        if group_name not in groups:

            groups[group_name] = []

        groups[group_name].append(skill)

    return groups


# ============================================================
# CALCULATE GROUP COVERAGE
# ============================================================

def calculate_group_coverage(
    required_skills,
    exact_matches,
    related_matches,
    contextual_matches,
):
    """
    Calculate coverage for each applicable skill group.

    Exact       = 1.00
    Related     = 0.50
    Contextual  = 0.25

    This does NOT modify the main ATS score.
    """

    groups = get_groups_for_skills(
        required_skills
    )

    exact_set = {
        normalize_skill(skill)
        for skill in exact_matches
    }

    related_set = {
        normalize_skill(skill)
        for skill in related_matches
    }

    contextual_set = {
        normalize_skill(skill)
        for skill in contextual_matches
    }

    coverage = {}

    for group_name, skills in groups.items():

        group_weight = 0

        matched_skills = []

        missing_skills = []

        for skill in skills:

            normalized = normalize_skill(
                skill
            )

            # --------------------------------------------
            # EXACT
            # --------------------------------------------

            if normalized in exact_set:

                group_weight += 1.0

                matched_skills.append({
                    "skill": skill,
                    "match_type": "exact",
                    "weight": 1.0,
                })

            # --------------------------------------------
            # RELATED
            # --------------------------------------------

            elif normalized in related_set:

                group_weight += 0.50

                matched_skills.append({
                    "skill": skill,
                    "match_type": "related",
                    "weight": 0.50,
                })

            # --------------------------------------------
            # CONTEXTUAL
            # --------------------------------------------

            elif normalized in contextual_set:

                group_weight += 0.25

                matched_skills.append({
                    "skill": skill,
                    "match_type": "contextual",
                    "weight": 0.25,
                })

            # --------------------------------------------
            # MISSING
            # --------------------------------------------

            else:

                missing_skills.append(
                    skill
                )

        total_skills = len(skills)

        if total_skills > 0:

            percentage = int(
                (
                    group_weight
                    /
                    total_skills
                )
                * 100
            )

        else:

            percentage = 0

        coverage[group_name] = {

            "total_skills": total_skills,

            "matched_weight": group_weight,

            "percentage": percentage,

            "matched_skills": matched_skills,

            "missing_skills": missing_skills,
        }

    return coverage