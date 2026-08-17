# ======================================================
# IMPORT LIBRARIES
# ======================================================

import streamlit as st
import pdfplumber
import plotly.express as px

from utils.ats import calculate_ats_score
from utils.suggestions import get_missing_skills
from utils.job_roles import recommend_role
from utils.skill_match import get_skill_match
from utils.gemini_ai import analyze_resume

# ======================================================
# PAGE CONFIGURATION
# ======================================================

st.set_page_config(
    page_title="AI Resume Analyzer",
    page_icon="📄",
    layout="wide"
)

st.title("📄 AI Resume Analyzer")
st.markdown("### Upload your resume and get an instant ATS analysis")


# ======================================================
# FILE UPLOAD
# ======================================================

uploaded_file = st.file_uploader(
    "Choose your Resume (PDF only)",
    type=["pdf"]
)


# ======================================================
# PROCESS ONLY AFTER FILE IS UPLOADED
# ======================================================

if uploaded_file is not None:

    st.success("Resume Uploaded Successfully!")

    # -----------------------------------
    # Extract PDF Text
    # -----------------------------------

    text = ""

    with pdfplumber.open(uploaded_file) as pdf:

        for page in pdf.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text

    # =====================================
    # AI Resume Analysis
    # =====================================

    with st.spinner("🤖 AI is analyzing your resume..."):
        ai_feedback = analyze_resume(text)

    # -----------------------------------
    # ATS Score
    # -----------------------------------

    score, skills = calculate_ats_score(text)


    # -----------------------------------
    # Missing Skills
    # -----------------------------------

    missing_skills = get_missing_skills(skills)


    # =====================================
    # Recommend Job Role
    # =====================================

    recommended_role = recommend_role(skills)


    # =====================================
    # AI Analysis
    # =====================================

    with st.spinner("🤖 AI is analyzing your resume..."):

        ai_feedback = analyze_resume(text)


    # -----------------------------------
    # Dashboard Chart
    # -----------------------------------

    chart_data = {
        "Category": [
            "Found Skills",
            "Missing Skills"
        ],

        "Count": [
            len(skills),
            len(missing_skills)
        ]
    }

    fig = px.pie(

        values=chart_data["Count"],

        names=chart_data["Category"],

        title="Resume Skill Analysis"

    )


    # ======================================================
    # CREATE TABS
    # ======================================================

    tab1, tab2, tab3 = st.tabs([
        "📄 Resume",
        "📊 Analysis",
        "💡 Suggestions"
    ])


    # ======================================================
    # TAB 1
    # ======================================================

    with tab1:

        st.subheader("Uploaded Resume")

        st.text_area(
            "Resume Text",
            text,
            height=450
        )


    # ======================================================
    # TAB 2
    # ======================================================

    with tab2:

        st.subheader("ATS Score")

        st.progress(score / 100)

        st.metric(
            "ATS Score",
            f"{score}%"
        )

        st.divider()

        st.subheader("Skills Found")

        if skills:

            cols = st.columns(3)

            for i, skill in enumerate(skills):
                cols[i % 3].success(skill)

        else:
            st.warning("No skills detected.")

        st.divider()

        st.subheader("Dashboard")

        st.plotly_chart(
            fig,
            use_container_width=True
        )

        st.divider()

        col1, col2, col3 = st.columns(3)

        col1.metric(
            "ATS Score",
            f"{score}%"
        )

        col2.metric(
            "Skills Found",
            len(skills)
        )

        col3.metric(
            "Missing Skills",
            len(missing_skills)
        )

        st.divider()

        st.subheader("💼 Recommended Career")

        st.success(recommended_role)

        skill_match = get_skill_match(skills)

    # ======================================================
    # TAB 3
    # ======================================================

    with tab3:

        st.subheader("Missing Skills")

        cols = st.columns(3)

        for i, skill in enumerate(missing_skills[:10]):
            cols[i % 3].error(skill)

        st.divider()

        st.subheader("Resume Suggestions")

        if score < 40:

            st.error("""
### Your resume needs improvement

• Add more technical skills

• Build projects

• Add certifications

• Mention internships

• Improve GitHub profile
""")

        elif score < 70:

            st.warning("""
### Good Resume

• Learn Cloud

• Improve Projects

• Add GitHub

• Add measurable achievements
""")

        else:

            st.success("""
### Excellent Resume

• Keep GitHub updated

• Deploy projects

• Learn advanced technologies

• Keep certifications updated
""")


    st.divider()
    st.subheader("🤖 AI Resume Feedback")
    st.metric(
        "AI Resume Score",
        ai_feedback["resume_score"]
    )

    st.subheader("💪 Strengths")
    for item in ai_feedback["strengths"]:
        st.success(item)


    st.subheader("⚠ Weaknesses")
    for item in ai_feedback["weaknesses"]:
        st.error(item)


    st.subheader("🚀 Suggestions")
    for item in ai_feedback["suggestions"]:
        st.info(item)


    st.subheader("💼 Recommended Jobs")
    for job in ai_feedback["recommended_jobs"]:
        st.success(job)