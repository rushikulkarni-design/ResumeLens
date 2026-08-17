import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Target,
  CircleAlert,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface Props {
  skills: string[];
  missingSkills: string[];
  exactMatches?: string[];
  relatedMatches?: string[];
  contextualMatches?: string[];
}

function clamp(value: unknown, min = 0, max = 100): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return min;
  }

  return Math.max(min, Math.min(max, number));
}

function uniqueSkills(skills: string[] = []): string[] {
  const seen = new Set<string>();

  return skills.filter((skill) => {
    const value = String(skill ?? "").trim();
    const normalized = value.toLowerCase();

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);

    return true;
  });
}

export default function SkillsChart({
  skills = [],
  missingSkills = [],
  exactMatches = [],
  relatedMatches = [],
  contextualMatches = [],
}: Props) {
  /* ==========================================================
     CLEAN DATA
  ========================================================== */

  const exact = uniqueSkills(exactMatches);
  const related = uniqueSkills(relatedMatches);
  const contextual = uniqueSkills(contextualMatches);
  const missing = uniqueSkills(missingSkills);
  const detectedSkills = uniqueSkills(skills);

  /* ==========================================================
     COUNTS
  ========================================================== */

  const exactCount = exact.length;
  const relatedCount = related.length;
  const contextualCount = contextual.length;
  const missingCount = missing.length;
  const detectedCount = detectedSkills.length;

  const totalRoleSkills =
    exactCount +
    relatedCount +
    contextualCount +
    missingCount;

  /* ==========================================================
     WEIGHTED COVERAGE
  ========================================================== */

  const weightedEvidence =
    exactCount +
    relatedCount * 0.5 +
    contextualCount * 0.25;

  const roleCoverage =
    totalRoleSkills > 0
      ? clamp(
          Math.round(
            (weightedEvidence / totalRoleSkills) * 100
          )
        )
      : 0;

  /* ==========================================================
     EVIDENCE
  ========================================================== */

  const skillsWithEvidence =
    exactCount +
    relatedCount +
    contextualCount;

  const evidenceCoverage =
    totalRoleSkills > 0
      ? clamp(
          Math.round(
            (skillsWithEvidence / totalRoleSkills) * 100
          )
        )
      : 0;

  /* ==========================================================
     MISSING
  ========================================================== */

  const missingPercentage =
    totalRoleSkills > 0
      ? clamp(
          Math.round(
            (missingCount / totalRoleSkills) * 100
          )
        )
      : 0;

  /* ==========================================================
     PIE DATA
  ========================================================== */

  const chartData = [
    {
      name: "Direct",
      value: exactCount,
      color: "#22c55e",
    },
    {
      name: "Related",
      value: relatedCount,
      color: "#3b82f6",
    },
    {
      name: "Contextual",
      value: contextualCount,
      color: "#eab308",
    },
    {
      name: "Missing",
      value: missingCount,
      color: "#ef4444",
    },
  ].filter((item) => item.value > 0);

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div
      className="
        relative
        flex
        h-full
        min-h-0
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        p-4
        shadow-soft
        xl:h-[620px]
      "
    >
      {/* Background glow */}

      <div
        className="
          pointer-events-none
          absolute
          -left-16
          -top-16
          h-40
          w-40
          rounded-full
          bg-purple-500/10
          blur-3xl
        "
      />

      <div
        className="
          relative
          flex
          min-h-0
          flex-1
          flex-col
        "
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            shrink-0
            items-start
            justify-between
            gap-3
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                rounded-xl
                bg-purple-500/10
                p-2.5
              "
            >
              <BarChart3
                className="
                  h-5
                  w-5
                  text-purple-400
                "
              />
            </div>

            <div>
              <h2
                className="
                  text-base
                  font-bold
                  tracking-tight
                  text-foreground
                "
              >
                Skill Coverage
              </h2>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  leading-4
                  text-muted-foreground
                "
              >
                Your resume alignment with the selected role.
              </p>
            </div>
          </div>

          <div
            className="
              shrink-0
              rounded-full
              border
              border-border
              bg-muted/30
              px-2.5
              py-1
              text-[9px]
              font-medium
              text-muted-foreground
            "
          >
            Role Skills
          </div>
        </div>

        {/* ====================================================
            CHART
        ==================================================== */}

        <div
          className="
            relative
            mx-auto
            mt-2
            h-[175px]
            w-full
            max-w-[300px]
            shrink-0
          "
        >
          {totalRoleSkills > 0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={53}
                  outerRadius={76}
                  paddingAngle={4}
                  cornerRadius={7}
                  stroke="none"
                  animationBegin={150}
                  animationDuration={900}
                >
                  {chartData.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border:
                      "1px solid var(--border)",
                    borderRadius: "10px",
                    color:
                      "var(--foreground)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="
                flex
                h-full
                items-center
                justify-center
                text-center
              "
            >
              <div>
                <Target
                  className="
                    mx-auto
                    h-8
                    w-8
                    text-muted-foreground
                  "
                />

                <p
                  className="
                    mt-2
                    text-sm
                    font-medium
                  "
                >
                  No role skills available
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-muted-foreground
                  "
                >
                  Select a role to calculate skill coverage.
                </p>
              </div>
            </div>
          )}

          {totalRoleSkills > 0 && (
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                flex
                flex-col
                items-center
                justify-center
              "
            >
              <span
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-foreground
                "
              >
                {roleCoverage}%
              </span>

              <span
                className="
                  mt-0.5
                  text-[10px]
                  text-muted-foreground
                "
              >
                Weighted Coverage
              </span>
            </div>
          )}
        </div>

        {/* ====================================================
            LEGEND
        ==================================================== */}

        <div
          className="
            flex
            shrink-0
            flex-wrap
            justify-center
            gap-x-4
            gap-y-1.5
          "
        >
          <div
            className="
              flex
              items-center
              gap-1.5
              text-[9px]
              text-muted-foreground
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-green-500
              "
            />
            Direct
          </div>

          <div
            className="
              flex
              items-center
              gap-1.5
              text-[9px]
              text-muted-foreground
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-blue-500
              "
            />
            Related
          </div>

          <div
            className="
              flex
              items-center
              gap-1.5
              text-[9px]
              text-muted-foreground
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-yellow-500
              "
            />
            Contextual
          </div>

          <div
            className="
              flex
              items-center
              gap-1.5
              text-[9px]
              text-muted-foreground
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-red-500
              "
            />
            Missing
          </div>
        </div>

        {/* ====================================================
            MAIN STATISTICS
        ==================================================== */}

        <div
          className="
            mt-3
            grid
            shrink-0
            grid-cols-2
            gap-2.5
          "
        >
          {/* Weighted Evidence */}

          <div
            className="
              rounded-xl
              border
              border-purple-500/20
              bg-purple-500/10
              p-3
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <div
                className="
                  rounded-lg
                  bg-purple-500/10
                  p-1.5
                "
              >
                <Target
                  className="
                    h-4
                    w-4
                    text-purple-400
                  "
                />
              </div>

              <span
                className="
                  text-[10px]
                  font-semibold
                  text-purple-400
                "
              >
                {roleCoverage}%
              </span>
            </div>

            <p
              className="
                mt-2
                text-2xl
                font-bold
                text-purple-400
              "
            >
              {weightedEvidence.toFixed(1)}
            </p>

            <p
              className="
                text-[10px]
                font-medium
                text-muted-foreground
              "
            >
              Weighted Evidence
            </p>

            <p
              className="
                mt-1
                text-[8px]
                leading-3
                text-purple-300/80
              "
            >
              Direct, related, and contextual matches are weighted differently.
            </p>
          </div>

          {/* Evidence Coverage */}

          <div
            className="
              rounded-xl
              border
              border-blue-500/20
              bg-blue-500/10
              p-3
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <div
                className="
                  rounded-lg
                  bg-blue-500/10
                  p-1.5
                "
              >
                <CircleAlert
                  className="
                    h-4
                    w-4
                    text-blue-400
                  "
                />
              </div>

              <span
                className="
                  text-[10px]
                  font-semibold
                  text-blue-400
                "
              >
                {evidenceCoverage}%
              </span>
            </div>

            <p
              className="
                mt-2
                text-2xl
                font-bold
                text-blue-400
              "
            >
              {skillsWithEvidence}
            </p>

            <p
              className="
                text-[10px]
                font-medium
                text-muted-foreground
              "
            >
              Skills With Evidence
            </p>

            <p
              className="
                mt-1
                text-[8px]
                leading-3
                text-blue-300/80
              "
            >
              Required skills with direct or supporting resume evidence.
            </p>
          </div>
        </div>

        {/* ====================================================
            MISSING SKILLS
        ==================================================== */}

        <div
          className="
            mt-2.5
            flex
            shrink-0
            items-center
            justify-between
            rounded-xl
            border
            border-red-500/20
            bg-red-500/10
            px-3
            py-2
          "
        >
          <div
            className="
              flex
              items-center
              gap-2.5
            "
          >
            <div
              className="
                rounded-lg
                bg-red-500/10
                p-1.5
              "
            >
              <XCircle
                className="
                  h-4
                  w-4
                  text-red-400
                "
              />
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  text-red-400
                "
              >
                Missing Role Skills
              </p>

              <p
                className="
                  text-[8px]
                  text-muted-foreground
                "
              >
                Skills with no detected evidence
              </p>
            </div>
          </div>

          <div className="text-right">
            <p
              className="
                text-lg
                font-bold
                leading-5
                text-red-400
              "
            >
              {missingCount}
            </p>

            <p
              className="
                text-[8px]
                text-red-300/80
              "
            >
              {missingPercentage}%
            </p>
          </div>
        </div>

        {/* ====================================================
            MATCH BREAKDOWN
        ==================================================== */}

        <div
          className="
            mt-2.5
            grid
            shrink-0
            grid-cols-3
            gap-2
          "
        >
          {/* Direct */}

          <div
            className="
              rounded-xl
              border
              border-green-500/20
              bg-green-500/5
              p-2
              text-center
            "
          >
            <CheckCircle2
              className="
                mx-auto
                h-3.5
                w-3.5
                text-green-400
              "
            />

            <p
              className="
                mt-1
                text-base
                font-bold
                text-green-400
              "
            >
              {exactCount}
            </p>

            <p
              className="
                text-[8px]
                text-muted-foreground
              "
            >
              Direct
            </p>

            <p
              className="
                mt-0.5
                text-[7px]
                text-green-300/70
              "
            >
              ×1.00
            </p>
          </div>

          {/* Related */}

          <div
            className="
              rounded-xl
              border
              border-blue-500/20
              bg-blue-500/5
              p-2
              text-center
            "
          >
            <Target
              className="
                mx-auto
                h-3.5
                w-3.5
                text-blue-400
              "
            />

            <p
              className="
                mt-1
                text-base
                font-bold
                text-blue-400
              "
            >
              {relatedCount}
            </p>

            <p
              className="
                text-[8px]
                text-muted-foreground
              "
            >
              Related
            </p>

            <p
              className="
                mt-0.5
                text-[7px]
                text-blue-300/70
              "
            >
              ×0.50
            </p>
          </div>

          {/* Contextual */}

          <div
            className="
              rounded-xl
              border
              border-yellow-500/20
              bg-yellow-500/5
              p-2
              text-center
            "
          >
            <CircleAlert
              className="
                mx-auto
                h-3.5
                w-3.5
                text-yellow-400
              "
            />

            <p
              className="
                mt-1
                text-base
                font-bold
                text-yellow-400
              "
            >
              {contextualCount}
            </p>

            <p
              className="
                text-[8px]
                text-muted-foreground
              "
            >
              Contextual
            </p>

            <p
              className="
                mt-0.5
                text-[7px]
                text-yellow-300/70
              "
            >
              ×0.25
            </p>
          </div>
        </div>

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div
          className="
            mt-2.5
            grid
            shrink-0
            grid-cols-2
            gap-2
          "
        >
          <div
            className="
              rounded-xl
              border
              border-border/50
              bg-muted/20
              px-3
              py-2
            "
          >
            <p
              className="
                text-[8px]
                text-muted-foreground
              "
            >
              Required Skills
            </p>

            <p
              className="
                mt-0.5
                text-base
                font-semibold
              "
            >
              {totalRoleSkills}
            </p>

            <p
              className="
                mt-0.5
                text-[7px]
                leading-3
                text-muted-foreground
              "
            >
              Role skills used for coverage calculation.
            </p>
          </div>

          <div
            className="
              rounded-xl
              border
              border-border/50
              bg-muted/20
              px-3
              py-2
            "
          >
            <p
              className="
                text-[8px]
                text-muted-foreground
              "
            >
              Evidence
            </p>

            <p
              className="
                mt-0.5
                text-base
                font-semibold
              "
            >
              {skillsWithEvidence} / {totalRoleSkills}
            </p>

            <p
              className="
                mt-0.5
                text-[7px]
                leading-3
                text-muted-foreground
              "
            >
              Skills with direct or supporting evidence.
            </p>
          </div>
        </div>

        {/* ====================================================
            RESUME SKILLS
        ==================================================== */}

        <div
          className="
            mt-2.5
            shrink-0
            rounded-xl
            border
            border-border/50
            bg-muted/20
            px-3
            py-2
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div>
              <p
                className="
                  text-[8px]
                  text-muted-foreground
                "
              >
                Resume skills detected
              </p>

              <p
                className="
                  mt-0.5
                  text-base
                  font-semibold
                "
              >
                {detectedCount}
              </p>
            </div>

            <p
              className="
                max-w-[250px]
                text-right
                text-[7px]
                leading-3
                text-muted-foreground
              "
            >
              Total skills detected in your resume, separate from the skills required by the selected role.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}