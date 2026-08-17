import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  Layers3,
  Code2,
  Database,
  Wrench,
  ShieldCheck,
} from "lucide-react";

interface RecommendationObject {
  skill?: string;
  group?: string;
  importance?: string;
  priority?: string;
  status?: string;
  title?: string;
  action?: string;
  resume_guidance?: string;
}

interface RoleCompetency {
  importance?: string;
  skills?: string[];
  skill_count?: number;
  [key: string]: unknown;
}

interface Props {
  skills: string[];
  missingSkills: string[];
  exactMatches: string[];
  relatedMatches: string[];
  contextualMatches: string[];

  skillGroups: Record<string, string[]>;

  groupCoverage: Record<string, number>;

  roleCompetencies: Record<
    string,
    RoleCompetency | unknown
  >;

  skillRecommendations: Array<
    string | RecommendationObject
  >;
}


/* ============================================================
   HELPERS
============================================================ */

function cleanText(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function formatLabel(value: string): string {
  const cleaned = cleanText(value);

  return cleaned
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
}


function normalizeSkill(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.]/g, "")
    .trim();
}


function getGroupIcon(group: string) {
  const name = group.toLowerCase();

  if (
    name.includes("program") ||
    name.includes("language") ||
    name.includes("development")
  ) {
    return Code2;
  }

  if (
    name.includes("database") ||
    name.includes("data")
  ) {
    return Database;
  }

  if (
    name.includes("tool") ||
    name.includes("devops") ||
    name.includes("infrastructure")
  ) {
    return Wrench;
  }

  if (
    name.includes("testing") ||
    name.includes("security")
  ) {
    return ShieldCheck;
  }

  return Layers3;
}


/* ============================================================
   SKILL LIST
============================================================ */

function SkillList({
  skills,
  emptyText,
}: {
  skills: string[];
  emptyText: string;
}) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-5">
        <p className="text-sm text-muted-foreground">
          {emptyText}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className="
            rounded-full
            border
            border-border
            bg-background
            px-3
            py-1.5
            text-xs
            font-medium
            text-foreground
          "
        >
          {skill}
        </span>
      ))}
    </div>
  );
}


/* ============================================================
   COVERAGE BAR
============================================================ */

function CoverageBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const score = Math.min(
    100,
    Math.max(
      0,
      Number.isFinite(value)
        ? value
        : 0
    )
  );

  return (
    <div className="space-y-2">

      <div className="flex items-center justify-between gap-3">

        <span className="text-sm font-medium text-foreground">
          {formatLabel(label)}
        </span>

        <span className="text-xs font-medium text-muted-foreground">
          {Math.round(score)}%
        </span>

      </div>

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
            width: `${score}%`,
          }}
        />
      </div>

    </div>
  );
}


/* ============================================================
   CALCULATE REAL GROUP COVERAGE
============================================================ */

function calculateGroupCoverage(
  group: string,
  groupSkills: string[],
  detectedSkills: string[],
  backendValue?: number
): number {

  /*
   * If backend gives a meaningful value,
   * use it.
   */
  if (
    typeof backendValue === "number" &&
    Number.isFinite(backendValue) &&
    backendValue > 0
  ) {
    return Math.min(
      100,
      Math.max(0, backendValue)
    );
  }


  /*
   * Otherwise calculate coverage ourselves.
   */

  if (
    !Array.isArray(groupSkills) ||
    groupSkills.length === 0
  ) {
    return 0;
  }


  const detected = new Set(
    detectedSkills.map(normalizeSkill)
  );


  const matched = groupSkills.filter(
    (skill) =>
      detected.has(
        normalizeSkill(skill)
      )
  );


  return Math.round(
    (matched.length /
      groupSkills.length) *
      100
  );
}


/* ============================================================
   RECOMMENDATION TEXT
============================================================ */

function getRecommendationText(
  recommendation:
    | string
    | RecommendationObject
): string {

  if (
    typeof recommendation === "string"
  ) {
    return recommendation;
  }


  return (
    recommendation.title ||
    recommendation.action ||
    recommendation.resume_guidance ||
    recommendation.skill ||
    "Consider strengthening this skill."
  );
}


/* ============================================================
   ROLE COMPETENCY
============================================================ */

function RoleCompetencyCard({
  group,
  value,
}: {
  group: string;
  value: RoleCompetency | unknown;
}) {

  const competency =
    value &&
    typeof value === "object"
      ? (value as RoleCompetency)
      : {};


  const skills =
    Array.isArray(
      competency.skills
    )
      ? competency.skills
      : [];


  const importance =
    typeof competency.importance ===
    "string"
      ? competency.importance
      : "supporting";


  const Icon =
    getGroupIcon(group);


  return (
    <div
      className="
        rounded-xl
        border
        border-border
        bg-background/50
        p-5
        transition-colors
        hover:bg-background
      "
    >

      <div className="flex items-start justify-between gap-4">

        <div className="flex items-center gap-3">

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
            <Icon
              className="size-4"
              strokeWidth={1.8}
            />
          </div>

          <div>

            <h4 className="text-sm font-semibold">
              {formatLabel(group)}
            </h4>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {skills.length} skill
              {skills.length === 1
                ? ""
                : "s"}
            </p>

          </div>

        </div>


        <span
          className="
            rounded-full
            border
            border-border
            bg-muted
            px-2.5
            py-1
            text-[10px]
            font-medium
            capitalize
            text-muted-foreground
          "
        >
          {importance}
        </span>

      </div>


      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">

          {skills.map(
            (skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="
                  rounded-md
                  border
                  border-border
                  bg-card
                  px-2.5
                  py-1
                  text-xs
                  text-foreground
                "
              >
                {skill}
              </span>
            )
          )}

        </div>
      )}

    </div>
  );
}


/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function SkillsSection({
  skills = [],
  missingSkills = [],
  exactMatches = [],
  relatedMatches = [],
  contextualMatches = [],
  skillGroups = {},
  groupCoverage = {},
  roleCompetencies = {},
  skillRecommendations = [],
}: Props) {


  /* ==========================================================
     SAFE DATA
  ========================================================== */

  const detectedSkills =
    Array.isArray(skills)
      ? skills
      : [];


  const missing =
    Array.isArray(missingSkills)
      ? missingSkills
      : [];


  const exact =
    Array.isArray(exactMatches)
      ? exactMatches
      : [];


  const related =
    Array.isArray(relatedMatches)
      ? relatedMatches
      : [];


  const contextual =
    Array.isArray(contextualMatches)
      ? contextualMatches
      : [];


  const recommendations =
    Array.isArray(
      skillRecommendations
    )
      ? skillRecommendations
      : [];


  /* ==========================================================
     GROUPS
  ========================================================== */

  const groupEntries =
    Object.entries(
      skillGroups ?? {}
    );


  /* ==========================================================
     ROLE COMPETENCIES
  ========================================================== */

  const competencyEntries =
    Object.entries(
      roleCompetencies ?? {}
    );


  /* ==========================================================
     CALCULATED COVERAGE
  ========================================================== */

  const coverageEntries =
    groupEntries.map(
      ([group, groupSkills]) => {

        const backendValue =
          Number(
            groupCoverage?.[group]
          );


        const value =
          calculateGroupCoverage(
            group,
            Array.isArray(groupSkills)
              ? groupSkills
              : [],
            detectedSkills,
            backendValue
          );


        return [
          group,
          value,
        ] as const;
      }
    );


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <section
      className="
        rounded-2xl
        border
        border-border
        bg-card
        p-6
        shadow-soft
        sm:p-7
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>

        <div className="flex items-center gap-3">

          <div
            className="
              grid
              size-10
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

          <div>

            <h2
              className="
                text-lg
                font-semibold
                tracking-tight
              "
            >
              Skills & recommendations
            </h2>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              See which skills your resume covers
              and where you can strengthen your profile.
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          DETECTED + MISSING
      ====================================================== */}

      <div
        className="
          mt-7
          grid
          items-stretch
          gap-5
          lg:grid-cols-2
        "
      >

        {/* DETECTED */}

        <div
          className="
            flex
            min-h-[220px]
            flex-col
            rounded-xl
            border
            border-border
            bg-background/40
            p-5
          "
        >

          <div className="mb-5 flex items-center gap-3">

            <div
              className="
                grid
                size-9
                shrink-0
                place-items-center
                rounded-lg
                bg-emerald-500/10
                text-emerald-600
              "
            >
              <CheckCircle2
                className="size-4"
                strokeWidth={1.8}
              />
            </div>

            <div>

              <h3 className="text-sm font-semibold">
                Detected skills
              </h3>

              <p className="text-xs text-muted-foreground">
                Skills identified from your resume.
              </p>

            </div>

          </div>

          <SkillList
            skills={detectedSkills}
            emptyText="No skills were detected."
          />

        </div>


        {/* MISSING */}

        <div
          className="
            flex
            min-h-[220px]
            flex-col
            rounded-xl
            border
            border-border
            bg-background/40
            p-5
          "
        >

          <div className="mb-5 flex items-center gap-3">

            <div
              className="
                grid
                size-9
                shrink-0
                place-items-center
                rounded-lg
                bg-amber-500/10
                text-amber-600
              "
            >
              <AlertCircle
                className="size-4"
                strokeWidth={1.8}
              />
            </div>

            <div>

              <h3 className="text-sm font-semibold">
                Skills to consider
              </h3>

              <p className="text-xs text-muted-foreground">
                Skills that may strengthen your role match.
              </p>

            </div>

          </div>

          <SkillList
            skills={missing}
            emptyText="No major missing skills were identified."
          />

        </div>

      </div>


      {/* ======================================================
          SKILL MATCHING
      ====================================================== */}

      <div className="mt-7">

        <h3 className="text-sm font-semibold">
          Skill matching
        </h3>

        <div
          className="
            mt-4
            grid
            items-stretch
            gap-4
            md:grid-cols-3
          "
        >

          {/* EXACT */}

          <div
            className="
              rounded-xl
              border
              border-border
              bg-background/40
              p-5
            "
          >

            <p className="text-xs text-muted-foreground">
              Exact matches
            </p>

            <div className="mt-2 flex items-end gap-1">

              <span
                className="
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-primary
                "
              >
                {exact.length}
              </span>

            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Direct skill matches
            </p>

          </div>


          {/* RELATED */}

          <div
            className="
              rounded-xl
              border
              border-border
              bg-background/40
              p-5
            "
          >

            <p className="text-xs text-muted-foreground">
              Related matches
            </p>

            <span
              className="
                mt-2
                block
                text-3xl
                font-semibold
                tracking-tight
                text-primary
              "
            >
              {related.length}
            </span>

            <p className="mt-2 text-xs text-muted-foreground">
              Related skill matches
            </p>

          </div>


          {/* CONTEXTUAL */}

          <div
            className="
              rounded-xl
              border
              border-border
              bg-background/40
              p-5
            "
          >

            <p className="text-xs text-muted-foreground">
              Contextual matches
            </p>

            <span
              className="
                mt-2
                block
                text-3xl
                font-semibold
                tracking-tight
                text-primary
              "
            >
              {contextual.length}
            </span>

            <p className="mt-2 text-xs text-muted-foreground">
              Context-based matches
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          SKILL GROUP COVERAGE
      ====================================================== */}

      {coverageEntries.length > 0 && (
        <div className="mt-7">

          <div className="mb-4">

            <h3 className="text-sm font-semibold">
              Skill group coverage
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              How well your detected skills cover each skill area.
            </p>

          </div>


          <div
            className="
              grid
              gap-4
              md:grid-cols-2
            "
          >

            {coverageEntries.map(
              ([group, value]) => (
                <div
                  key={group}
                  className="
                    rounded-xl
                    border
                    border-border
                    bg-background/40
                    p-5
                  "
                >

                  <CoverageBar
                    label={group}
                    value={value}
                  />

                </div>
              )
            )}

          </div>

        </div>
      )}


      {/* ======================================================
          RECOMMENDATIONS
      ====================================================== */}

      {recommendations.length > 0 && (
        <div className="mt-7">

          <div className="mb-4 flex items-center gap-3">

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
              <Lightbulb
                className="size-4"
                strokeWidth={1.8}
              />
            </div>

            <div>

              <h3 className="text-sm font-semibold">
                Recommendations
              </h3>

              <p className="text-xs text-muted-foreground">
                Practical ways to strengthen your resume.
              </p>

            </div>

          </div>


          <div
            className="
              grid
              gap-3
              md:grid-cols-2
            "
          >

            {recommendations.map(
              (recommendation, index) => {

                const text =
                  getRecommendationText(
                    recommendation
                  );


                return (
                  <div
                    key={`${text}-${index}`}
                    className="
                      rounded-xl
                      border
                      border-border
                      bg-background/40
                      p-4
                    "
                  >

                    <div className="flex gap-3">

                      <div
                        className="
                          mt-0.5
                          grid
                          size-7
                          shrink-0
                          place-items-center
                          rounded-full
                          bg-primary/10
                          text-primary
                        "
                      >
                        <Lightbulb
                          className="size-3.5"
                          strokeWidth={1.8}
                        />
                      </div>

                      <p
                        className="
                          text-sm
                          leading-6
                          text-foreground
                        "
                      >
                        {text}
                      </p>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>
      )}


      {/* ======================================================
          ROLE COMPETENCIES
      ====================================================== */}

      {competencyEntries.length > 0 && (
        <div className="mt-7">

          <div className="mb-4">

            <h3 className="text-sm font-semibold">
              Role competencies
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Key technical areas associated with your target role.
            </p>

          </div>


          <div
            className="
              grid
              gap-4
              md:grid-cols-2
            "
          >

            {competencyEntries.map(
              ([group, value]) => (
                <RoleCompetencyCard
                  key={group}
                  group={group}
                  value={value}
                />
              )
            )}

          </div>

        </div>
      )}

    </section>
  );
}