export type AnalysisResult = {
  metrics: { label: string; value: number; delta: string; hint: string }[];
  summary: string;
  feedback: { tone: "good" | "warn" | "bad"; title: string; body: string }[];
  skills: string[];
  missingSkills: string[];
  radar: { axis: string; score: number; benchmark: number }[];
  sections: { section: string; score: number }[];
  keywordSplit: { name: string; value: number }[];
  timeline: { month: string; score: number }[];
  jobs: { role: string; company: string; location: string; match: number; salary: string }[];
  salary: { role: string; low: number; mid: number; high: number }[];
};

export const analysis: AnalysisResult = {
  metrics: [
    { label: "ATS Score", value: 86, delta: "+12", hint: "Parsed cleanly by 9 of 10 systems" },
    { label: "Resume Quality", value: 78, delta: "+6", hint: "Structure and clarity above average" },
    { label: "Hiring Probability", value: 64, delta: "+9", hint: "Based on 4,120 similar profiles" },
    { label: "AI Match", value: 91, delta: "+4", hint: "Against Senior Frontend Engineer" },
  ],
  summary:
    "Strong engineering narrative with measurable impact. Tighten the summary, quantify two more achievements, and add the missing platform keywords to clear automated screens with confidence.",
  feedback: [
    {
      tone: "good",
      title: "Impact is quantified",
      body: "7 of 11 bullets contain metrics. This places the resume in the top 18% of submissions for the role.",
    },
    {
      tone: "warn",
      title: "Summary runs long",
      body: "The opening paragraph is 68 words. Reduce to 2 lines and lead with your strongest outcome.",
    },
    {
      tone: "warn",
      title: "Dates formatting inconsistent",
      body: "Two roles use 'Jan 2023', one uses '01/2023'. Normalise to a single format for reliable parsing.",
    },
    {
      tone: "bad",
      title: "No link to work",
      body: "Add a portfolio or GitHub link near your contact block — recruiters open it 62% of the time.",
    },
  ],
  skills: [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "GraphQL",
    "PostgreSQL",
    "Tailwind CSS",
    "Jest",
    "Figma",
    "CI/CD",
  ],
  missingSkills: ["System Design", "Kubernetes", "Playwright", "Terraform", "gRPC"],
  radar: [
    { axis: "Clarity", score: 88, benchmark: 72 },
    { axis: "Impact", score: 81, benchmark: 68 },
    { axis: "Keywords", score: 74, benchmark: 70 },
    { axis: "Format", score: 92, benchmark: 76 },
    { axis: "Brevity", score: 66, benchmark: 71 },
    { axis: "Relevance", score: 85, benchmark: 69 },
  ],
  sections: [
    { section: "Header", score: 94 },
    { section: "Summary", score: 62 },
    { section: "Experience", score: 88 },
    { section: "Projects", score: 79 },
    { section: "Skills", score: 71 },
    { section: "Education", score: 90 },
  ],
  keywordSplit: [
    { name: "Matched", value: 62 },
    { name: "Partial", value: 21 },
    { name: "Missing", value: 17 },
  ],
  timeline: [
    { month: "Mar", score: 58 },
    { month: "Apr", score: 63 },
    { month: "May", score: 67 },
    { month: "Jun", score: 72 },
    { month: "Jul", score: 79 },
    { month: "Aug", score: 86 },
  ],
  jobs: [
    {
      role: "Senior Frontend Engineer",
      company: "Northwind Labs",
      location: "Remote · EU",
      match: 94,
      salary: "$142k – $168k",
    },
    {
      role: "Product Engineer",
      company: "Cadence",
      location: "Berlin, DE",
      match: 89,
      salary: "€92k – €110k",
    },
    {
      role: "Design Engineer",
      company: "Halcyon",
      location: "Remote · Global",
      match: 84,
      salary: "$128k – $150k",
    },
    {
      role: "Full-Stack Engineer",
      company: "Meridian",
      location: "Bengaluru, IN",
      match: 78,
      salary: "₹38L – ₹52L",
    },
  ],
  salary: [
    { role: "Mid", low: 78, mid: 96, high: 112 },
    { role: "Senior", low: 118, mid: 142, high: 168 },
    { role: "Staff", low: 160, mid: 188, high: 214 },
  ],
};

export const history = [
  { id: "r-104", name: "Aarav_Sharma_Resume_v4.pdf", date: "Aug 4, 2026", size: "412 KB", score: 86 },
  { id: "r-103", name: "Aarav_Sharma_Resume_v3.pdf", date: "Jul 21, 2026", size: "398 KB", score: 79 },
  { id: "r-102", name: "Frontend_Focus_Resume.pdf", date: "Jun 30, 2026", size: "376 KB", score: 72 },
  { id: "r-101", name: "Aarav_Sharma_Resume_v2.pdf", date: "May 18, 2026", size: "364 KB", score: 67 },
  { id: "r-100", name: "Aarav_Sharma_Resume_v1.pdf", date: "Apr 6, 2026", size: "351 KB", score: 58 },
];
