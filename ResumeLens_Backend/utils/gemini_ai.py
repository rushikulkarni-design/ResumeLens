# ============================================================
# GEMINI AI CONFIGURATION
# ============================================================

import json
import os

from dotenv import load_dotenv
from google import genai


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()


API_KEY = os.getenv("GEMINI_API_KEY")


if not API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured in the .env file."
    )


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=API_KEY
)


# ============================================================
# GEMINI MODEL
# ============================================================

MODEL_NAME = "gemini-3.6-flash"


# ============================================================
# DEFAULT AI RESPONSE
# ============================================================

def _default_response():

    return {
        "resume_score": 0,
        "strengths": [],
        "weaknesses": [],
        "missing_skills": [],
        "suggestions": [],
        "recommended_jobs": [],
    }


# ============================================================
# CLEAN JSON RESPONSE
# ============================================================

def _parse_json_response(text):

    if not text:
        raise ValueError(
            "Gemini returned an empty response."
        )

    text = text.strip()

    # Remove accidental markdown fences
    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    text = text.strip()

    return json.loads(text)


# ============================================================
# AI RESUME ANALYSIS
# ============================================================

def analyze_resume(resume_text):

    if not resume_text or not resume_text.strip():

        return {
            "resume_score": 0,
            "strengths": [],
            "weaknesses": [
                "No readable resume text was found."
            ],
            "missing_skills": [],
            "suggestions": [
                "Upload a resume containing readable text."
            ],
            "recommended_jobs": [],
        }


    prompt = f"""
You are an expert ATS recruiter and professional resume reviewer.

Analyze the resume below.

Your analysis must be based ONLY on the information contained
in the resume.

Do not invent skills, projects, experience, education,
certifications, or achievements.

Return ONLY valid JSON.

The JSON must follow exactly this structure:

{{
  "resume_score": 8.5,
  "strengths": [
    "strength 1",
    "strength 2",
    "strength 3"
  ],
  "weaknesses": [
    "weakness 1",
    "weakness 2",
    "weakness 3"
  ],
  "missing_skills": [
    "skill 1",
    "skill 2",
    "skill 3"
  ],
  "suggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3"
  ],
  "recommended_jobs": [
    "job 1",
    "job 2",
    "job 3"
  ]
}}

Rules:

1. resume_score must be a number between 0 and 10.

2. strengths must contain concrete strengths found in the
   resume.

3. weaknesses must identify genuine weaknesses or gaps.

4. missing_skills should contain skills that would reasonably
   strengthen the candidate's profile based on the resume.
   Do not claim the candidate lacks a skill unless the resume
   provides insufficient evidence for it.

5. suggestions must be practical and specific.

6. recommended_jobs should contain realistic job roles based
   only on the candidate's demonstrated skills and experience.

7. Do not use Markdown.

8. Do not wrap the JSON in ``` or ```json.

9. Return valid JSON only.

RESUME:

{resume_text}
"""


    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
            },
        )

        result = _parse_json_response(
            response.text
        )


        # ----------------------------------------------------
        # Validate response structure
        # ----------------------------------------------------

        if not isinstance(result, dict):
            raise ValueError(
                "Gemini response is not a JSON object."
            )


        # ----------------------------------------------------
        # Normalize score
        # ----------------------------------------------------

        try:

            score = float(
                result.get(
                    "resume_score",
                    0
                )
            )

        except (TypeError, ValueError):

            score = 0


        score = max(
            0,
            min(
                10,
                score
            )
        )


        # ----------------------------------------------------
        # Normalize arrays
        # ----------------------------------------------------

        def normalize_list(value):

            if isinstance(value, list):

                return [
                    str(item).strip()
                    for item in value
                    if str(item).strip()
                ]

            return []


        return {

            "resume_score": score,

            "strengths": normalize_list(
                result.get("strengths")
            ),

            "weaknesses": normalize_list(
                result.get("weaknesses")
            ),

            "missing_skills": normalize_list(
                result.get("missing_skills")
            ),

            "suggestions": normalize_list(
                result.get("suggestions")
            ),

            "recommended_jobs": normalize_list(
                result.get("recommended_jobs")
            ),
        }


    except Exception as e:

        print(
            "============================================"
        )

        print(
            "GEMINI AI ERROR"
        )

        print(
            str(e)
        )

        print(
            "============================================"
        )

        # Return a structured response instead of
        # crashing the complete resume analysis.

        fallback = _default_response()

        fallback["weaknesses"] = [
            "AI feedback could not be generated for this analysis."
        ]

        fallback["suggestions"] = [
            "Review the ATS score, skill coverage, and prioritized skill improvements above."
        ]

        return fallback