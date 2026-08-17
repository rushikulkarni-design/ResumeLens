import pandas as pd

def get_missing_skills(found_skills):
    skills = pd.read_csv("data/skills.csv")

    all_skills = skills["skill"].tolist()

    missing = []

    for skill in all_skills:
        if skill not in found_skills:
            missing.append(skill)

    return missing