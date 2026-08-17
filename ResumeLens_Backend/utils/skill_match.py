import random

def get_skill_match(skills):

    skill_scores = {}

    for skill in skills:

        skill_scores[skill] = random.randint(70,100)

    return skill_scores