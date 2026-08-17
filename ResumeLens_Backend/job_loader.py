import csv
from pathlib import Path


# ============================================================
# JOB DATASET LOCATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATASET_DIR = BASE_DIR / "job_datasets"


# ============================================================
# GET ALL AVAILABLE JOB TITLES
# ============================================================

def get_job_titles():
    """
    Reads all CSV files from job_datasets
    and converts their filenames into job titles.
    """

    if not DATASET_DIR.exists():
        return []

    titles = []

    for csv_file in sorted(DATASET_DIR.glob("*.csv")):

        # Remove .csv
        name = csv_file.stem

        # Remove numbering such as:
        # 01_
        # 02_
        # 50_
        if "_" in name:
            name = name.split("_", 1)[1]

        # Convert underscores to spaces
        title = name.replace("_", " ")

        titles.append(title)

    return titles


# ============================================================
# FIND CSV FILE FOR JOB TITLE
# ============================================================

def find_job_file(job_title: str):
    """
    Finds the CSV file corresponding to a job title.
    """

    if not job_title:
        return None

    requested = (
        job_title
        .strip()
        .lower()
        .replace(" ", "_")
    )

    for csv_file in DATASET_DIR.glob("*.csv"):

        name = csv_file.stem

        if "_" in name:
            name = name.split("_", 1)[1]

        normalized_name = name.lower()

        if normalized_name == requested:
            return csv_file

    return None


# ============================================================
# LOAD REQUIRED SKILLS FOR JOB
# ============================================================

def get_job_skills(job_title: str):
    """
    Reads the selected job's CSV.

    Each CSV contains one column of required skills.
    """

    csv_file = find_job_file(job_title)

    if csv_file is None:
        return []

    skills = []

    with open(
        csv_file,
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        reader = csv.reader(file)

        for row in reader:

            if not row:
                continue

            skill = row[0].strip()

            if skill:
                skills.append(skill)

    return skills