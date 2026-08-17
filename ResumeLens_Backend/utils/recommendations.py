# ============================================================
# SKILL IMPROVEMENT RECOMMENDATIONS
# ============================================================


def _normalize(value):
    return str(value or "").lower().strip()


def _priority_from_importance(importance):
    importance = _normalize(importance)

    if importance in ("core", "important"):
        return "high"

    if importance == "supporting":
        return "medium"

    return "low"


def _recommendation_action(skill, priority, match_type):
    if match_type == "contextual":
        return (
            f"Make your existing evidence for {skill} more explicit. "
            f"Use the skill name in a relevant project, experience, "
            f"or technical description where it is genuinely applicable."
        )

    if priority == "high":
        return (
            f"Develop practical experience with {skill} and add "
            f"genuine project or experience evidence demonstrating it."
        )

    if priority == "medium":
        return (
            f"Strengthen your experience with {skill} through a "
            f"relevant project, coursework, or practical implementation."
        )

    return (
        f"Consider gaining practical exposure to {skill} and "
        f"include it in your resume when you have genuine evidence."
    )


def _resume_guidance(skill, match_type):
    if match_type == "contextual":
        return (
            f"Explicitly mention {skill} in the relevant project "
            f"or experience bullet where it is actually used."
        )

    return (
        f"After gaining genuine experience with {skill}, add it "
        f"to your Skills section and support it with a project "
        f"or experience bullet."
    )


def build_skill_recommendations(
    role_competencies,
    skill_groups,
    missing_skills,
    contextual_matches,
    exact_matches=None,
    related_matches=None,
    limit=12,
):
    """
    Build role-aware skill improvement recommendations.

    Priority:
        core / important -> high
        supporting        -> medium
        everything else   -> low

    Contextual matches are treated as evidence-strengthening
    recommendations rather than completely missing skills.
    """

    exact_matches = exact_matches or []
    related_matches = related_matches or []

    exact_set = {
        _normalize(skill)
        for skill in exact_matches
    }

    related_set = {
        _normalize(skill)
        for skill in related_matches
    }

    contextual_set = {
        _normalize(skill)
        for skill in contextual_matches
    }

    missing_set = {
        _normalize(skill)
        for skill in missing_skills
    }

    recommendations = []

    # --------------------------------------------------------
    # Build skill -> group / importance lookup
    # --------------------------------------------------------

    skill_metadata = {}

    for group_name, group_skills in skill_groups.items():

        competency = role_competencies.get(
            group_name,
            {},
        )

        importance = competency.get(
            "importance",
            "supporting",
        )

        priority = _priority_from_importance(
            importance
        )

        for skill in group_skills:

            normalized = _normalize(skill)

            if not normalized:
                continue

            skill_metadata[normalized] = {
                "skill": skill,
                "group": group_name,
                "importance": importance,
                "priority": priority,
            }

    # --------------------------------------------------------
    # Contextual recommendations
    # --------------------------------------------------------

    for skill in contextual_matches:

        normalized = _normalize(skill)

        if normalized in exact_set:
            continue

        metadata = skill_metadata.get(
            normalized,
            {
                "skill": skill,
                "group": "other",
                "importance": "supporting",
                "priority": "medium",
            },
        )

        recommendations.append(
            {
                "skill": metadata["skill"],
                "group": metadata["group"],
                "importance": metadata["importance"],
                "priority": metadata["priority"],
                "status": "contextual",
                "title": f"Strengthen {metadata['skill']} evidence",
                "action": _recommendation_action(
                    metadata["skill"],
                    metadata["priority"],
                    "contextual",
                ),
                "resume_guidance": _resume_guidance(
                    metadata["skill"],
                    "contextual",
                ),
            }
        )

    # --------------------------------------------------------
    # Missing skill recommendations
    # --------------------------------------------------------

    for skill in missing_skills:

        normalized = _normalize(skill)

        if normalized in exact_set:
            continue

        if normalized in related_set:
            continue

        if normalized in contextual_set:
            continue

        metadata = skill_metadata.get(
            normalized,
            {
                "skill": skill,
                "group": "other",
                "importance": "supporting",
                "priority": "medium",
            },
        )

        recommendations.append(
            {
                "skill": metadata["skill"],
                "group": metadata["group"],
                "importance": metadata["importance"],
                "priority": metadata["priority"],
                "status": "missing",
                "title": f"Develop {metadata['skill']}",
                "action": _recommendation_action(
                    metadata["skill"],
                    metadata["priority"],
                    "missing",
                ),
                "resume_guidance": _resume_guidance(
                    metadata["skill"],
                    "missing",
                ),
            }
        )

    # --------------------------------------------------------
    # Priority sorting
    # --------------------------------------------------------

    priority_order = {
        "high": 0,
        "medium": 1,
        "low": 2,
    }

    status_order = {
        "missing": 0,
        "contextual": 1,
    }

    recommendations.sort(
        key=lambda item: (
            priority_order.get(
                item["priority"],
                3,
            ),
            status_order.get(
                item["status"],
                3,
            ),
            item["skill"].lower(),
        )
    )

    return recommendations[:limit]