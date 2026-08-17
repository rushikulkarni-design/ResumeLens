from utils.gemini_ai import analyze_resume

resume = """
Name: Rushi Kulkarni

Skills:
Python
SQL
Machine Learning
YOLO
OpenCV
Streamlit
Git
GitHub

Projects:
AI Resume Analyzer
Smart Parking System
"""

result = analyze_resume(resume)

print(result)