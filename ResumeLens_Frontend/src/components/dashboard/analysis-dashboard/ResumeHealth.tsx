import {
  CheckCircle2,
  AlertCircle,
  FileText,
  Target,
  Layers3,
} from "lucide-react";

interface Props {
  analysis: any;
}


/* ============================================================
   HELPERS
============================================================ */

function clampScore(
  value: unknown
): number {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, score)
  );
}


function getStatus(
  score: number
): {
  label: string;
  good: boolean;
} {
  if (score >= 80) {
    return {
      label: "Strong",
      good: true,
    };
  }

  if (score >= 60) {
    return {
      label: "Good",
      good: true,
    };
  }

  if (score >= 40) {
    return {
      label: "Needs improvement",
      good: false,
    };
  }

  return {
    label: "Needs attention",
    good: false,
  };
}


/* ============================================================
   METRIC
============================================================ */

function Metric({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {

  const score =
    clampScore(value);

  const status =
    getStatus(score);


  return (
    <div
      className="
        rounded-xl
        border
        border-border
        bg-background/40
        p-4
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >

        <div className="flex min-w-0 gap-3">

          <div
            className="
              grid
              size-9
              shrink-0
              place-items-center
              rounded-lg
              bg-primary/10
              text-primary
            "
          >
            {icon}
          </div>


          <div className="min-w-0">

            <p
              className="
                text-sm
                font-medium
              "
            >
              {label}
            </p>


            <p
              className="
                mt-1
                text-xs
                leading-5
                text-muted-foreground
              "
            >
              {description}
            </p>

          </div>

        </div>


        <div className="shrink-0 text-right">

          <p
            className="
              text-lg
              font-semibold
              text-primary
            "
          >
            {Math.round(score)}%
          </p>

          <p
            className="
              text-[10px]
              text-muted-foreground
            "
          >
            {status.label}
          </p>

        </div>

      </div>


      {/* Progress */}

      <div
        className="
          mt-4
          h-1.5
          overflow-hidden
          rounded-full
          bg-muted
        "
      >

        <div
          className="
            h-full
            rounded-full
            bg-primary
            transition-all
            duration-700
          "
          style={{
            width:
              `${score}%`,
          }}
        />

      </div>

    </div>
  );
}


/* ============================================================
   MAIN
============================================================ */

export default function ResumeHealth({
  analysis,
}: Props) {

  if (!analysis) {
    return null;
  }


  /* ----------------------------------------------------------
     EXISTING ANALYSIS VALUES
  ---------------------------------------------------------- */

  const atsScore =
    clampScore(
      analysis?.ats_score
    );


  const resumeScore =
    clampScore(
      analysis?.ai_feedback
        ?.resume_score ??
      analysis?.resume_score ??
      atsScore
    );


  const technicalScore =
    clampScore(
      analysis?.score_breakdown
        ?.technical_capability ??
      analysis?.score_breakdown
        ?.technical_depth ??
      0
    );


  const roleScore =
    clampScore(
      analysis?.score_breakdown
        ?.role_skill_coverage ??
      analysis?.role_skill_coverage ??
      0
    );


  const skillCount =
    Array.isArray(
      analysis?.skills
    )
      ? analysis.skills.length
      : 0;


  const missingCount =
    Array.isArray(
      analysis?.missing_skills
    )
      ? analysis.missing_skills.length
      : 0;


  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div
      className="
        rounded-2xl
        border
        border-border
        bg-card
        p-6
        shadow-soft
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >

        <div>

          <h2
            className="
              text-lg
              font-semibold
              tracking-tight
            "
          >
            Resume health
          </h2>

          <p
            className="
              mt-1
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            A quick overview of the strengths and areas
            that need attention in your resume.
          </p>

        </div>


        {/* OVERALL */}

        <div
          className="
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-primary/20
            bg-primary/5
            px-4
            py-3
          "
        >

          <div
            className="
              grid
              size-9
              place-items-center
              rounded-lg
              bg-primary/10
              text-primary
            "
          >
            <FileText
              className="size-4"
            />
          </div>


          <div>

            <p
              className="
                text-[10px]
                font-medium
                uppercase
                tracking-wide
                text-muted-foreground
              "
            >
              Overall health
            </p>

            <p
              className="
                text-lg
                font-semibold
                text-primary
              "
            >
              {Math.round(
                resumeScore
              )}%
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          METRICS
      ====================================================== */}

      <div
        className="
          mt-6
          grid
          gap-4
          md:grid-cols-2
        "
      >

        <Metric
          label="ATS readiness"
          value={atsScore}
          description="Compatibility with applicant tracking systems."
          icon={
            <Target
              className="size-4"
              strokeWidth={1.8}
            />
          }
        />


        <Metric
          label="Technical strength"
          value={technicalScore}
          description="Technical skills and evidence found in your resume."
          icon={
            <Layers3
              className="size-4"
              strokeWidth={1.8}
            />
          }
        />


        <Metric
          label="Role alignment"
          value={roleScore}
          description="How closely your skills match the selected role."
          icon={
            <CheckCircle2
              className="size-4"
              strokeWidth={1.8}
            />
          }
        />


        <Metric
          label="Skill coverage"
          value={
            skillCount > 0
              ? Math.min(
                  skillCount * 5,
                  100
                )
              : 0
          }
          description={
            missingCount > 0
              ? `${skillCount} skills detected and ${missingCount} areas to improve.`
              : `${skillCount} relevant skills detected from your resume.`
          }
          icon={
            missingCount > 0 ? (
              <AlertCircle
                className="size-4"
                strokeWidth={1.8}
              />
            ) : (
              <CheckCircle2
                className="size-4"
                strokeWidth={1.8}
              />
            )
          }
        />

      </div>

    </div>
  );
}