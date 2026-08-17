import { motion } from "motion/react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import type { UploadedFile } from "@/components/dashboard/upload-panel";

const ease = [0.22, 1, 0.36, 1] as const;


// ============================================================
// REVEAL
// ============================================================

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.55,
        delay,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}


// ============================================================
// PANEL
// ============================================================

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "hairline overflow-hidden rounded-2xl bg-surface shadow-soft",
        className,
      ].join(" ")}
    >
      <header className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">
          {title}
        </h3>
      </header>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}


// ============================================================
// ANALYSIS VIEW
// ============================================================

export function AnalysisView({
  file,
  analysis,
}: {
  file: UploadedFile;
  analysis: any;
}) {
  if (!analysis) {
    return null;
  }

  const feedback = analysis.ai_feedback ?? {};

  const strengths = Array.isArray(feedback.strengths)
    ? feedback.strengths
    : [];

  const weaknesses = Array.isArray(feedback.weaknesses)
    ? feedback.weaknesses
    : [];

  const suggestions = Array.isArray(feedback.suggestions)
    ? feedback.suggestions
    : [];

  const skills = Array.isArray(analysis.skills)
    ? analysis.skills
    : [];

  const missingSkills = Array.isArray(analysis.missing_skills)
    ? analysis.missing_skills
    : [];

  const atsScore = Number(analysis.ats_score ?? 0);

  const resumeScore =
    feedback.resume_score !== undefined &&
    feedback.resume_score !== null
      ? feedback.resume_score
      : null;

  const gaugeData = [
    {
      name: "ATS",
      value: atsScore,
      fill: "#3b82f6",
    },
  ];

  const skillsChartData = [
    {
      name: "Skills Found",
      value: skills.length,
    },
    {
      name: "Missing Skills",
      value: missingSkills.length,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-9 sm:px-8 sm:py-12">

      {/* ======================================================
          FILE HEADER
      ====================================================== */}

      <Reveal>
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-6">

          <div className="flex min-w-0 items-center gap-4">

            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>

            <div className="min-w-0">

              <h2 className="truncate text-lg font-bold text-foreground sm:text-xl">
                {file.name}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {file.size} • Resume analyzed successfully
              </p>

            </div>

          </div>


          <div className="flex shrink-0 items-center gap-2">

            <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-2 text-xs font-medium text-green-500">

              <CheckCircle2 className="h-4 w-4" />

              Analysis Complete

            </span>

          </div>

        </div>
      </Reveal>


      {/* ======================================================
          TOP SUMMARY CARDS
      ====================================================== */}

      <Reveal delay={0.12}>

        <div className="mt-6 grid gap-5 md:grid-cols-2">

          {/* ATS SCORE */}

          <Panel title="ATS Score">

            <div className="py-4">

              <div className="flex items-end justify-between gap-4">

                <div>

                  <h2 className="text-5xl font-bold tracking-tight text-primary">
                    {atsScore}%
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Applicant Tracking Score
                  </p>

                </div>

                <div className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                  {atsScore >= 80
                    ? "Excellent"
                    : atsScore >= 60
                      ? "Good"
                      : "Needs Work"}
                </div>

              </div>


              <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">

                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, atsScore),
                    )}%`,
                  }}
                />

              </div>

            </div>

          </Panel>


          {/* SKILLS */}

          <Panel title="Skills Found">

            <div className="py-4">

              <div className="flex items-end justify-between gap-4">

                <div>

                  <h2 className="text-5xl font-bold tracking-tight text-blue-500">
                    {skills.length}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Skills detected from your resume
                  </p>

                </div>

                <div className="rounded-xl bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-400">
                  {missingSkills.length} missing
                </div>

              </div>


              <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">

                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${Math.max(
                      8,
                      Math.min(
                        100,
                        skills.length /
                          Math.max(
                            1,
                            skills.length +
                              missingSkills.length,
                          ) *
                          100,
                      ),
                    )}%`,
                  }}
                />

              </div>

            </div>

          </Panel>

        </div>

      </Reveal>


      {/* ======================================================
          CHARTS
      ====================================================== */}

      <Reveal delay={0.2}>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* ATS GAUGE */}

          <Panel title="ATS Compatibility">

            <div className="h-[300px] w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <RadialBarChart
                  cx="50%"
                  cy="55%"
                  innerRadius="65%"
                  outerRadius="90%"
                  barSize={18}
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                >

                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />

                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                  />

                  <text
                    x="50%"
                    y="53%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-4xl font-bold"
                  >
                    {atsScore}%
                  </text>

                  <text
                    x="50%"
                    y="65%"
                    textAnchor="middle"
                    className="fill-muted-foreground text-sm"
                  >
                    ATS Score
                  </text>

                </RadialBarChart>

              </ResponsiveContainer>

            </div>

          </Panel>


          {/* SKILLS DISTRIBUTION */}

          <Panel title="Skill Coverage">

            <div className="h-[300px] w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={skillsChartData}
                    cx="50%"
                    cy="45%"
                    outerRadius={95}
                    innerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >

                    <Cell fill="#22c55e" />

                    <Cell fill="#ef4444" />

                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </Panel>

        </div>

      </Reveal>


      {/* ======================================================
          SKILLS
      ====================================================== */}

      <Reveal delay={0.3}>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* DETECTED */}

          <Panel title="Detected Skills">

            {skills.length > 0 ? (

              <div className="flex flex-wrap gap-2.5">

                {skills.map((skill: string, index: number) => (

                  <span
                    key={`${skill}-${index}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-300"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />

                    {skill}

                  </span>

                ))}

              </div>

            ) : (

              <p className="text-sm text-muted-foreground">
                No skills detected.
              </p>

            )}

          </Panel>


          {/* MISSING */}

          <Panel title="Missing Skills">

            {missingSkills.length > 0 ? (

              <div className="flex flex-wrap gap-2.5">

                {missingSkills.map(
                  (skill: string, index: number) => (

                    <span
                      key={`${skill}-${index}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />

                      {skill}

                    </span>

                  ),
                )}

              </div>

            ) : (

              <p className="text-sm text-muted-foreground">
                No missing skills detected.
              </p>

            )}

          </Panel>

        </div>

      </Reveal>


      {/* ======================================================
          RESUME PREVIEW + AI FEEDBACK
      ====================================================== */}

      <Reveal delay={0.4}>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">

          {/* ==================================================
                  RESUME PREVIEW
              ================================================== */}

              {/* RESUME PREVIEW */}

    <section className="self-start h-fit min-h-0 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">

      <div className="flex items-center justify-between border-b border-border px-5 py-4">

        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Resume Preview
          </h3>

          <p className="mt-1 text-[10px] text-muted-foreground">
            Extracted content from uploaded resume
          </p>
        </div>

        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>

      </div>

      <div className="bg-background/40 p-5">

        <div className="mx-auto w-full rounded-xl bg-white p-7 shadow-sm">

          <div className="whitespace-pre-wrap break-words font-sans text-[11px] leading-[1.7] text-slate-800">
            {analysis?.resume_text || "Resume content is not available."}
          </div>

        </div>

      </div>

    </section>


          {/* ==================================================
              AI FEEDBACK
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">

            {/* HEADER */}

            <div className="flex items-center gap-3 border-b border-border px-5 py-4">

              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>

              <div>

                <h3 className="text-sm font-semibold text-foreground">
                  AI Resume Feedback
                </h3>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  AI-generated insights to help improve the quality and impact of your resume.
                </p>

              </div>

            </div>


            {/* FEEDBACK CONTENT */}

            <div className="p-5">

              <div className="space-y-5">


                {/* AI SCORE */}

                {resumeScore !== null && (

                  <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-[11px] font-medium text-primary">
                          AI Resume Score
                        </p>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Overall AI assessment
                        </p>

                      </div>

                      <div className="text-right">

                        <span className="text-2xl font-bold text-primary">
                          {resumeScore}
                        </span>

                        <span className="ml-1 text-[10px] text-muted-foreground">
                          /100
                        </span>

                      </div>

                    </div>


                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">

                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              Number(resumeScore) || 0,
                            ),
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                )}


                {/* STRENGTHS */}

                <div>

                  <div className="mb-3 flex items-center gap-2">

                    <CheckCircle2 className="h-4 w-4 text-green-500" />

                    <h4 className="text-xs font-semibold">
                      Strengths
                    </h4>

                  </div>


                  {strengths.length > 0 ? (

                    <div className="space-y-2">

                      {strengths.map(
                        (item: string, index: number) => (

                          <div
                            key={index}
                            className="rounded-xl border border-green-500/25 bg-green-500/[0.07] px-3.5 py-3"
                          >

                            <p className="text-[11px] leading-5 text-muted-foreground">
                              {item}
                            </p>

                          </div>

                        ),
                      )}

                    </div>

                  ) : (

                    <p className="text-xs text-muted-foreground">
                      No strengths detected.
                    </p>

                  )}

                </div>


                {/* WEAKNESSES */}

                <div>

                  <div className="mb-3 flex items-center gap-2">

                    <AlertTriangle className="h-4 w-4 text-yellow-500" />

                    <h4 className="text-xs font-semibold">
                      Weaknesses
                    </h4>

                  </div>


                  {weaknesses.length > 0 ? (

                    <div className="space-y-2">

                      {weaknesses.map(
                        (item: string, index: number) => (

                          <div
                            key={index}
                            className="rounded-xl border border-yellow-500/25 bg-yellow-500/[0.07] px-3.5 py-3"
                          >

                            <p className="text-[11px] leading-5 text-muted-foreground">
                              {item}
                            </p>

                          </div>

                        ),
                      )}

                    </div>

                  ) : (

                    <p className="text-xs text-muted-foreground">
                      No weaknesses detected.
                    </p>

                  )}

                </div>


                {/* SKILLS TO STRENGTHEN */}

                {missingSkills.length > 0 && (

                  <div>

                    <div className="mb-3 flex items-center gap-2">

                      <AlertTriangle className="h-4 w-4 text-orange-500" />

                      <h4 className="text-xs font-semibold">
                        Skills to Strengthen
                      </h4>

                    </div>


                    <div className="flex flex-wrap gap-2">

                      {missingSkills.map(
                        (skill: string, index: number) => (

                          <span
                            key={`${skill}-${index}`}
                            className="rounded-lg border border-orange-500/25 bg-orange-500/[0.07] px-3 py-2 text-[10px] font-medium text-muted-foreground"
                          >
                            {skill}
                          </span>

                        ),
                      )}

                    </div>

                  </div>

                )}


                {/* SUGGESTIONS */}

                <div>

                  <div className="mb-3 flex items-center gap-2">

                    <Sparkles className="h-4 w-4 text-primary" />

                    <h4 className="text-xs font-semibold">
                      Suggestions
                    </h4>

                  </div>


                  {suggestions.length > 0 ? (

                    <div className="space-y-2">

                      {suggestions.map(
                        (item: string, index: number) => (

                          <div
                            key={index}
                            className="rounded-xl border border-primary/25 bg-primary/[0.07] px-3.5 py-3"
                          >

                            <p className="text-[11px] leading-5 text-muted-foreground">
                              {item}
                            </p>

                          </div>

                        ),
                      )}

                    </div>

                  ) : (

                    <p className="text-xs text-muted-foreground">
                      No suggestions available.
                    </p>

                  )}

                </div>


                {/* RECOMMENDED ROLES */}

                {Array.isArray(analysis.recommended_roles) &&
                  analysis.recommended_roles.length > 0 && (

                    <div>

                      <div className="mb-3 flex items-center gap-2">

                        <Sparkles className="h-4 w-4 text-purple-400" />

                        <h4 className="text-xs font-semibold">
                          Recommended Roles
                        </h4>

                      </div>


                      <div className="grid gap-2 sm:grid-cols-2">

                        {analysis.recommended_roles.map(
                          (role: string, index: number) => (

                            <div
                              key={`${role}-${index}`}
                              className="rounded-xl border border-purple-500/25 bg-purple-500/[0.06] px-3 py-3"
                            >

                              <p className="text-[11px] font-medium text-foreground">
                                {role}
                              </p>

                            </div>

                          ),
                        )}

                      </div>

                    </div>

                  )}

              </div>

            </div>

          </section>

        </div>

      </Reveal>

    </div>
  );
}