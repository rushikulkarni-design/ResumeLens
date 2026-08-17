from resume_evidence import extract_resume_evidence


resume_text = """
RUSHI MANIKRAO KULKARNI

Software Developer | B.Tech Artificial Intelligence & Data Science

Entry-level developer with hands-on experience building functional web
applications, automation prototypes, and Python-based AI/data solutions.

Strong foundation in C, Python, and Java, with practical exposure to
data structures, application logic, APIs, and software-oriented problem solving.

TECHNICAL SKILLS

Programming C, Python, Java
Development Web application development, application logic, automation,
problem solving, debugging

Python / Data NumPy, Pandas, Matplotlib

Core Data Structures, Programming Fundamentals, Research & Documentation

PROJECTS

Solar Power Awareness & Investment Estimator — Community Engineering Project

Developed an informative web application focused on making solar-energy
information accessible.

Implemented a custom investment-estimator calculator using application logic.

Automatic Door Opening & Closing System — Engineering Exploration Project

Designed and developed a functional automated-door prototype using sensors
and microcontrollers.

Implemented motion detection logic to trigger the door mechanism automatically.

EDUCATION

Maharashtra Institute of Technology
B.Tech in Artificial Intelligence and Data Science

CERTIFICATIONS

Java Programming Certification
Programming with Python 3.X
Data Structures in C
"""


result = extract_resume_evidence(
    resume_text
)


print("\n================================")
print("RESUME EVIDENCE TEST")
print("================================")

print("\nSKILLS:")
print(result["skills"])

print("\nPROJECTS:")
for project in result["projects"]:
    print(project)

print("\nEDUCATION:")
print(result["education"])

print("\nCERTIFICATIONS:")
print(result["certifications"])

print("\nTECHNICAL EVIDENCE:")
for item in result["technical_evidence"]:
    print("-", item)

print("\nDEVELOPMENT EVIDENCE:")
for item in result["development_evidence"]:
    print("-", item)

print("\nQUALITY SIGNALS:")
print(result["quality_signals"])

print("\n================================")