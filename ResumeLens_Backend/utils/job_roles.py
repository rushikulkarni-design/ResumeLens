# ============================================
# JOB ROLE RECOMMENDATION
# ============================================

def recommend_role(skills):

    skills = [skill.lower() for skill in skills]

    # AI Engineer
    if (
        "python" in skills and
        "tensorflow" in skills and
        "machine learning" in skills
    ):
        return "🤖 AI / Machine Learning Engineer"

    # Data Analyst
    elif (
        "python" in skills and
        "sql" in skills and
        "pandas" in skills
    ):
        return "📊 Data Analyst"

    # Frontend
    elif (
        "html" in skills and
        "css" in skills and
        "javascript" in skills
    ):
        return "💻 Frontend Developer"

    # Backend
    elif (
        "java" in skills and
        "sql" in skills
    ):
        return "⚙ Backend Developer"

    else:
        return "🎯 Software Engineer"