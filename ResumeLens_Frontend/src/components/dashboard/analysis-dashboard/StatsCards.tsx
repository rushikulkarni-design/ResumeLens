import {
  Target,
  Award,
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


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  score,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  score: number;
}) {

  const safeScore =
    clampScore(score);


  return (
    <div
      className="
        rounded-2xl
        border
        border-border
        bg-card
        p-5
        shadow-soft
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-lift
      "
    >

      {/* ==================================================
          TOP
      ================================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >

        <div>

          <p
            className="
              text-xs
              font-medium
              text-muted-foreground
            "
          >
            {title}
          </p>


          <h3
            className="
              mt-3
              text-3xl
              font-semibold
              tracking-tight
              text-foreground
            "
          >
            {value}
          </h3>

        </div>


        <div
          className="
            grid
            size-10
            shrink-0
            place-items-center
            rounded-xl
            bg-primary/10
            text-primary
          "
        >
          {icon}
        </div>

      </div>


      {/* ==================================================
          DESCRIPTION
      ================================================== */}

      <p
        className="
          mt-2
          text-xs
          leading-5
          text-muted-foreground
        "
      >
        {subtitle}
      </p>


      {/* ==================================================
          PROGRESS
      ================================================== */}

      <div className="mt-5">

        <div
          className="
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
                `${safeScore}%`,
            }}
          />

        </div>


        <div
          className="
            mt-2
            flex
            items-center
            justify-between
          "
        >

          <span
            className="
              text-[11px]
              text-muted-foreground
            "
          >
            Current analysis
          </span>


          <span
            className="
              text-[11px]
              font-medium
              text-primary
            "
          >
            {Math.round(
              safeScore
            )}
            %
          </span>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   MAIN
============================================================ */

export default function StatsCards({
  analysis,
}: Props) {

  /* ----------------------------------------------------------
     ATS SCORE
  ---------------------------------------------------------- */

  const atsScore =
    clampScore(
      analysis?.ats_score
    );


  /* ----------------------------------------------------------
     SKILLS
  ---------------------------------------------------------- */

  const skillCount =
    Array.isArray(
      analysis?.skills
    )
      ? analysis.skills.length
      : 0;


  /*
   * Give the skills card a visual progress value.
   * This does not modify the actual analysis data.
   */

  const skillProgress =
    Math.min(
      skillCount * 5,
      100
    );


  return (
    <div
      className="
        grid
        gap-4
        sm:grid-cols-2
      "
    >

      {/* ==================================================
          ATS SCORE
      ================================================== */}

      <StatCard
        title="ATS Score"
        value={`${Math.round(
          atsScore
        )}%`}
        subtitle="Applicant Tracking System compatibility"
        score={atsScore}
        icon={
          <Target
            className="size-5"
            strokeWidth={1.8}
          />
        }
      />


      {/* ==================================================
          SKILLS
      ================================================== */}

      <StatCard
        title="Skills Detected"
        value={skillCount}
        subtitle="Relevant skills identified from your resume"
        score={skillProgress}
        icon={
          <Award
            className="size-5"
            strokeWidth={1.8}
          />
        }
      />

    </div>
  );
}