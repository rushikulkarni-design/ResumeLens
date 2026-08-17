import { Target } from "lucide-react";

interface Props {
  score: number;
}

function clampScore(value: unknown): number {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(100, Math.max(0, score));
}

function getLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Needs improvement";
  return "Needs attention";
}

export default function ATSGauge({
  score,
}: Props) {
  const safeScore = clampScore(score);

  return (
    <div
      className="
        flex
        h-full
        min-h-[500px]
        flex-col
        p-6
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center gap-3">

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
          <Target
            className="size-5"
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0">

          <h3
            className="
              text-base
              font-semibold
              text-foreground
            "
          >
            ATS compatibility
          </h3>

          <p
            className="
              text-xs
              leading-5
              text-muted-foreground
            "
          >
            How well your resume works with applicant
            tracking systems.
          </p>

        </div>

      </div>


      {/* =====================================================
          SCORE AREA
      ===================================================== */}

      <div className="mt-7 flex-1">

        <div
          className="
            flex
            items-end
            justify-between
            gap-4
          "
        >

          <div>

            <div
              className="
                text-5xl
                font-semibold
                tracking-tight
                text-primary
              "
            >
              {Math.round(safeScore)}%
            </div>

            <p
              className="
                mt-2
                text-sm
                text-muted-foreground
              "
            >
              {getLabel(safeScore)}
            </p>

          </div>


          <span
            className="
              shrink-0
              rounded-full
              border
              border-primary/20
              bg-primary/5
              px-3
              py-1
              text-xs
              font-medium
              text-primary
            "
          >
            ATS Score
          </span>

        </div>


        {/* =================================================
            PROGRESS BAR
        ================================================= */}

        <div className="mt-6">

          <div
            className="
              h-2
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
                width: `${safeScore}%`,
              }}
            />

          </div>


          <div
            className="
              mt-2
              flex
              justify-between
              text-[11px]
              text-muted-foreground
            "
          >
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>

        </div>

      </div>


      {/* =====================================================
          EXPLANATION
      ===================================================== */}

      <div
        className="
          mt-6
          rounded-xl
          border
          border-border
          bg-background/50
          p-4
        "
      >

        <p
          className="
            text-xs
            leading-5
            text-muted-foreground
          "
        >
          A higher ATS score means your resume is more likely
          to be parsed and matched effectively by automated
          applicant tracking systems.
        </p>

      </div>

    </div>
  );
}