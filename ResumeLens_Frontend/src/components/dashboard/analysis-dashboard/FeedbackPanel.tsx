import type { ReactNode } from "react";

import {
  AlertTriangle,
  Brain,
  Briefcase,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";

interface FeedbackItem {
  text?: string;
  description?: string;
  message?: string;
  title?: string;
  skill?: string;
  role?: string;
  name?: string;
  action?: string;
  recommendation?: string;
  [key: string]: unknown;
}

interface FeedbackData {
  resume_score?: number | string;

  strengths?: unknown;
  weaknesses?: unknown;
  missing_skills?: unknown;
  suggestions?: unknown;
  recommended_jobs?: unknown;

  error?: unknown;

  [key: string]: unknown;
}

interface Props {
  feedback: unknown;
}

/* ============================================================
   PARSE FEEDBACK
============================================================ */

function parseFeedback(
  feedback: unknown
): FeedbackData {
  if (!feedback) {
    return {};
  }

  if (
    typeof feedback === "object" &&
    feedback !== null
  ) {
    return feedback as FeedbackData;
  }

  if (typeof feedback === "string") {
    try {
      const parsed: unknown =
        JSON.parse(feedback);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        return parsed as FeedbackData;
      }
    } catch {
      return {};
    }
  }

  return {};
}


/* ============================================================
   CLEAN TEXT
============================================================ */

function cleanText(
  value: unknown
): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return "";
}


/* ============================================================
   NORMALIZE FEEDBACK ITEMS
============================================================ */

function normalizeItems(
  value: unknown
): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {

        if (
          typeof item === "string"
        ) {
          return item.trim();
        }

        if (
          typeof item === "number"
        ) {
          return String(item);
        }

        if (
          item &&
          typeof item === "object"
        ) {
          const object =
            item as FeedbackItem;

          return (
            cleanText(object.text) ||
            cleanText(
              object.description
            ) ||
            cleanText(
              object.message
            ) ||
            cleanText(object.title) ||
            cleanText(object.skill) ||
            cleanText(object.action) ||
            cleanText(
              object.recommendation
            ) ||
            cleanText(object.role) ||
            cleanText(object.name)
          );
        }

        return "";
      })
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((item) =>
        item
          .replace(
            /^[-•*]\s*/,
            ""
          )
          .trim()
      )
      .filter(Boolean);
  }

  if (
    typeof value === "object"
  ) {
    const object =
      value as FeedbackItem;

    const text =
      cleanText(object.text) ||
      cleanText(object.description) ||
      cleanText(object.message) ||
      cleanText(object.title) ||
      cleanText(object.skill) ||
      cleanText(object.action) ||
      cleanText(
        object.recommendation
      ) ||
      cleanText(object.role) ||
      cleanText(object.name);

    return text ? [text] : [];
  }

  return [];
}


/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">

      <div
        className="
          grid
          size-9
          shrink-0
          place-items-center
          rounded-xl
          bg-primary/10
          text-primary
        "
      >
        {icon}
      </div>

      <div className="min-w-0">

        <div className="flex items-center gap-2">

          <h2 className="text-sm font-semibold">
            {title}
          </h2>

          <span
            className="
              rounded-full
              bg-muted
              px-2
              py-0.5
              text-[10px]
              font-medium
              text-muted-foreground
            "
          >
            {count}
          </span>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   FEEDBACK CARD
============================================================ */

function FeedbackSection({
  title,
  items,
  icon,
  variant,
}: {
  title: string;
  items: string[];
  icon: ReactNode;
  variant:
    | "strength"
    | "weakness"
    | "skill"
    | "suggestion";
}) {

  const styles = {
    strength: {
      card:
        "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5",
      item:
        "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5",
      icon:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },

    weakness: {
      card:
        "border-amber-200/80 bg-amber-50/40 dark:border-amber-500/20 dark:bg-amber-500/5",
      item:
        "border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/5",
      icon:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },

    skill: {
      card:
        "border-orange-200/80 bg-orange-50/40 dark:border-orange-500/20 dark:bg-orange-500/5",
      item:
        "border-orange-200 bg-orange-50/60 dark:border-orange-500/20 dark:bg-orange-500/5",
      icon:
        "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },

    suggestion: {
      card:
        "border-blue-200/80 bg-blue-50/40 dark:border-blue-500/20 dark:bg-blue-500/5",
      item:
        "border-blue-200 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-500/5",
      icon:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
  };

  const current =
    styles[variant];

  return (
    <div
      className={`
        rounded-2xl
        border
        p-5
        ${current.card}
      `}
    >

      <div className="flex items-center gap-3">

        <div
          className={`
            grid
            size-9
            place-items-center
            rounded-xl
            ${current.icon}
          `}
        >
          {icon}
        </div>

        <div>

          <h2 className="text-sm font-semibold">
            {title}
          </h2>

          <p className="text-xs text-muted-foreground">
            {items.length} item
            {items.length === 1
              ? ""
              : "s"}
          </p>

        </div>

      </div>


      <div className="mt-4 space-y-2.5">

        {items.length > 0 ? (
          items.map(
            (item, index) => (
              <div
                key={`${title}-${index}`}
                className={`
                  rounded-xl
                  border
                  p-3.5
                  ${current.item}
                `}
              >
                <p
                  className="
                    text-[13px]
                    leading-5
                    text-foreground
                  "
                >
                  {item}
                </p>
              </div>
            )
          )
        ) : (
          <div
            className="
              rounded-xl
              border
              border-dashed
              border-border
              bg-background/40
              p-4
            "
          >
            <p className="text-xs text-muted-foreground">
              No information available.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}


/* ============================================================
   SCORE CARD
============================================================ */

function ScoreCard({
  score,
}: {
  score: number;
}) {

  const normalizedScore =
    Math.max(
      0,
      Math.min(10, score)
    );

  const percentage =
    normalizedScore * 10;

  const label =
    normalizedScore >= 8
      ? "Excellent"
      : normalizedScore >= 6
        ? "Good"
        : normalizedScore >= 4
          ? "Needs improvement"
          : "Needs significant improvement";

  return (
    <div
      className="
        rounded-2xl
        border
        border-primary/20
        bg-primary/5
        p-5
      "
    >

      <div className="flex items-center justify-between gap-5">

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

            <p className="text-sm font-semibold">
              AI Resume Score
            </p>

            <p className="text-xs text-muted-foreground">
              Overall resume assessment
            </p>

          </div>

        </div>


        <div className="text-right">

          <div className="flex items-baseline justify-end gap-1">

            <span
              className="
                text-3xl
                font-semibold
                tracking-tight
                text-primary
              "
            >
              {normalizedScore.toFixed(1)}
            </span>

            <span className="text-xs text-muted-foreground">
              /10
            </span>

          </div>

          <p className="text-[11px] text-muted-foreground">
            {label}
          </p>

        </div>

      </div>


      <div
        className="
          mt-4
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
            width: `${percentage}%`,
          }}
        />
      </div>

    </div>
  );
}


/* ============================================================
   RECOMMENDED ROLES
============================================================ */

function RecommendedRoles({
  roles,
}: {
  roles: string[];
}) {

  if (roles.length === 0) {
    return null;
  }

  return (
    <div
      className="
        rounded-2xl
        border
        border-border
        bg-background/40
        p-5
      "
    >

      <div className="flex items-center gap-3">

        <div
          className="
            grid
            size-9
            place-items-center
            rounded-xl
            bg-purple-500/10
            text-purple-500
          "
        >
          <Briefcase
            className="size-4"
            strokeWidth={1.8}
          />
        </div>

        <div>

          <h2 className="text-sm font-semibold">
            Recommended Roles
          </h2>

          <p className="text-xs text-muted-foreground">
            Roles that align with your resume.
          </p>

        </div>

      </div>


      <div
        className="
          mt-4
          grid
          gap-3
          sm:grid-cols-2
        "
      >

        {roles.map(
          (role, index) => (
            <div
              key={`${role}-${index}`}
              className="
                flex
                min-h-[52px]
                items-center
                gap-3
                rounded-xl
                border
                border-purple-200
                bg-purple-50/50
                px-4
                py-3
                dark:border-purple-500/20
                dark:bg-purple-500/5
              "
            >

              <Briefcase
                className="
                  size-4
                  shrink-0
                  text-purple-500
                "
                strokeWidth={1.8}
              />

              <span
                className="
                  text-sm
                  font-medium
                  text-foreground
                "
              >
                {role}
              </span>

            </div>
          )
        )}

      </div>

    </div>
  );
}


/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function FeedbackPanel({
  feedback,
}: Props) {

  const parsedFeedback =
    parseFeedback(feedback);


  const strengths =
    normalizeItems(
      parsedFeedback.strengths
    );

  const weaknesses =
    normalizeItems(
      parsedFeedback.weaknesses
    );

  const missingSkills =
    normalizeItems(
      parsedFeedback.missing_skills
    );

  const suggestions =
    normalizeItems(
      parsedFeedback.suggestions
    );

  const recommendedRoles =
    normalizeItems(
      parsedFeedback.recommended_jobs
    );


  let resumeScore =
    Number(
      parsedFeedback.resume_score ?? 0
    );


  if (
    !Number.isFinite(resumeScore)
  ) {
    resumeScore = 0;
  }


  const hasFeedback =
    strengths.length > 0 ||
    weaknesses.length > 0 ||
    missingSkills.length > 0 ||
    suggestions.length > 0 ||
    recommendedRoles.length > 0;


  const hasError =
    Boolean(
      parsedFeedback.error
    );


  return (
    <section
      className="
        h-full
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-card
        shadow-soft
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          border-b
          border-border
          px-6
          py-5
        "
      >

        <div className="flex items-start gap-3">

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
            <Brain
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
              AI Resume Feedback
            </h2>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-muted-foreground
              "
            >
              AI-generated insights to help improve
              the quality and impact of your resume.
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          BODY
      ====================================================== */}

      <div className="p-5 sm:p-6">

        {hasError && !hasFeedback && (
          <div
            className="
              rounded-2xl
              border
              border-amber-200
              bg-amber-50
              p-5
              dark:border-amber-500/20
              dark:bg-amber-500/5
            "
          >

            <div className="flex items-start gap-3">

              <AlertTriangle
                className="
                  mt-0.5
                  size-5
                  shrink-0
                  text-amber-500
                "
              />

              <div>

                <p className="text-sm font-semibold">
                  AI feedback is temporarily unavailable
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  The resume analysis completed successfully,
                  but AI feedback could not be generated.
                </p>

              </div>

            </div>

          </div>
        )}


        {hasFeedback ? (
          <div className="space-y-5">

            {/* SCORE */}

            {resumeScore > 0 && (
              <ScoreCard
                score={resumeScore}
              />
            )}


            {/* =================================================
                STRENGTH + WEAKNESS
            ================================================= */}

            <div
              className="
                grid
                items-stretch
                gap-4
                lg:grid-cols-2
              "
            >

              <FeedbackSection
                title="Strengths"
                items={strengths}
                variant="strength"
                icon={
                  <CheckCircle2
                    className="size-4"
                    strokeWidth={1.8}
                  />
                }
              />

              <FeedbackSection
                title="Weaknesses"
                items={weaknesses}
                variant="weakness"
                icon={
                  <AlertTriangle
                    className="size-4"
                    strokeWidth={1.8}
                  />
                }
              />

            </div>


            {/* =================================================
                SKILLS + SUGGESTIONS
            ================================================= */}

            <div
              className="
                grid
                items-stretch
                gap-4
                lg:grid-cols-2
              "
            >

              {missingSkills.length > 0 && (
                <FeedbackSection
                  title="Skills to Strengthen"
                  items={missingSkills}
                  variant="skill"
                  icon={
                    <Lightbulb
                      className="size-4"
                      strokeWidth={1.8}
                    />
                  }
                />
              )}

              {suggestions.length > 0 && (
                <FeedbackSection
                  title="Suggestions"
                  items={suggestions}
                  variant="suggestion"
                  icon={
                    <Sparkles
                      className="size-4"
                      strokeWidth={1.8}
                    />
                  }
                />
              )}

            </div>


            {/* =================================================
                RECOMMENDED ROLES
            ================================================= */}

            <RecommendedRoles
              roles={recommendedRoles}
            />

          </div>
        ) : (
          <div
            className="
              flex
              min-h-[260px]
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-border
              bg-background/30
              p-6
              text-center
            "
          >

            <div>

              <div
                className="
                  mx-auto
                  grid
                  size-12
                  place-items-center
                  rounded-2xl
                  bg-primary/10
                  text-primary
                "
              >
                <Sparkles
                  className="size-5"
                  strokeWidth={1.8}
                />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  font-medium
                "
              >
                AI feedback is not available
              </p>

              <p
                className="
                  mx-auto
                  mt-1
                  max-w-sm
                  text-xs
                  leading-5
                  text-muted-foreground
                "
              >
                Your resume scoring and skill analysis
                are still available above.
              </p>

            </div>

          </div>
        )}

      </div>

    </section>
  );
}