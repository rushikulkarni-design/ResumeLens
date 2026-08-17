interface Props {
  analysis: any;
}


/* ============================================================
   LABELS
============================================================ */

const LABELS: Record<string, string> = {
  technical_capability: "Technical Capability",
  role_skill_coverage: "Role Skill Coverage",
  project_evidence: "Project Evidence",
  role_relevance: "Role Relevance",
  technical_depth: "Technical Depth",
  education: "Education",
  certifications: "Certifications",
  resume_quality: "Resume Quality",
};


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


function getScoreLabel(
  score: number
): string {
  if (score >= 80) {
    return "Strong";
  }

  if (score >= 60) {
    return "Good";
  }

  if (score >= 40) {
    return "Needs improvement";
  }

  return "Needs attention";
}


/* ============================================================
   MAIN
============================================================ */

export default function ATSBreakdown({
  analysis,
}: Props) {

  const breakdown =
    analysis?.score_breakdown;

  const weights =
    analysis?.score_weights;


  if (!breakdown) {
    return null;
  }


  const entries =
    Object.entries(breakdown);


  const overall =
    clampScore(
      analysis?.ats_score
    );


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
            ATS score breakdown
          </h2>

          <p
            className="
              mt-1
              max-w-2xl
              text-sm
              leading-6
              text-muted-foreground
            "
          >
            See how your resume performs across the
            major evaluation factors.
          </p>

        </div>


        {/* OVERALL SCORE */}

        {analysis?.ats_score !==
          undefined && (

          <div
            className="
              shrink-0
              rounded-xl
              border
              border-primary/20
              bg-primary/5
              px-4
              py-3
              text-center
            "
          >

            <p
              className="
                text-[11px]
                font-medium
                uppercase
                tracking-wide
                text-muted-foreground
              "
            >
              Overall
            </p>

            <p
              className="
                mt-0.5
                text-xl
                font-semibold
                text-primary
              "
            >
              {Math.round(overall)}%
            </p>

          </div>

        )}

      </div>


      {/* ======================================================
          COMPONENTS
      ====================================================== */}

      <div className="mt-6 space-y-4">

        {entries.map(
          ([key, value]) => {

            const score =
              clampScore(value);

            const weight =
              clampScore(
                weights?.[key]
              );


            const label =
              LABELS[key] ||
              key
                .replace(
                  /_/g,
                  " "
                )
                .replace(
                  /\b\w/g,
                  (letter) =>
                    letter.toUpperCase()
                );


            const status =
              getScoreLabel(score);


            return (
              <div
                key={key}
                className="
                  rounded-xl
                  border
                  border-border
                  bg-background/40
                  p-4
                "
              >

                {/* ------------------------------------------
                    LABEL / SCORE
                ------------------------------------------ */}

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >

                  <div className="min-w-0">

                    <p
                      className="
                        text-sm
                        font-medium
                        text-foreground
                      "
                    >
                      {label}
                    </p>


                    <div
                      className="
                        mt-1
                        flex
                        flex-wrap
                        items-center
                        gap-x-3
                        gap-y-1
                      "
                    >

                      <span
                        className="
                          text-xs
                          text-muted-foreground
                        "
                      >
                        Weight: {Math.round(weight)}%
                      </span>

                      <span
                        className="
                          text-xs
                          text-muted-foreground
                        "
                      >
                        {status}
                      </span>

                    </div>

                  </div>


                  <span
                    className="
                      shrink-0
                      text-sm
                      font-semibold
                      text-primary
                    "
                  >
                    {Math.round(score)}%
                  </span>

                </div>


                {/* ------------------------------------------
                    PROGRESS BAR
                ------------------------------------------ */}

                <div
                  className="
                    mt-3
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
        )}

      </div>

    </div>
  );
}