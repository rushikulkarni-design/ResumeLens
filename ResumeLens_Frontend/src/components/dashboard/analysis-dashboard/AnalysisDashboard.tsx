import HeroHeader from "./HeroHeader";
import StatsCards from "./StatsCards";
import ATSGauge from "./ATSGauge";
import SkillsChart from "./SkillsChart";
import ResumeHealth from "./ResumeHealth";
import SkillsSection from "./SkillsSection";
import ResumePreview from "./ResumePreview";
import FeedbackPanel from "./FeedbackPanel";
import ActionButtons from "./ActionButtons";
import ATSBreakdown from "./ATSBreakdown";

import type { UploadedFile } from "@/components/dashboard/upload-panel";

interface Props {
  file: UploadedFile;
  analysis: any;
}

export default function AnalysisDashboard({
  file,
  analysis,
}: Props) {

  /* ==========================================================
     NO ANALYSIS
  ========================================================== */

  if (!analysis) {
    return null;
  }


  /* ==========================================================
     SAFE ANALYSIS DATA
  ========================================================== */

  const skills =
    Array.isArray(analysis.skills)
      ? analysis.skills
      : [];


  const missingSkills =
    Array.isArray(analysis.missing_skills)
      ? analysis.missing_skills
      : [];


  const exactMatches =
    Array.isArray(analysis.exact_matches)
      ? analysis.exact_matches
      : [];


  const relatedMatches =
    Array.isArray(analysis.related_matches)
      ? analysis.related_matches
      : [];


  const contextualMatches =
    Array.isArray(analysis.contextual_matches)
      ? analysis.contextual_matches
      : [];


  const skillGroups =
    analysis.skill_groups &&
    typeof analysis.skill_groups === "object"
      ? analysis.skill_groups
      : {};


  const groupCoverage =
    analysis.group_coverage &&
    typeof analysis.group_coverage === "object"
      ? analysis.group_coverage
      : {};


  const roleCompetencies =
    analysis.role_competencies &&
    typeof analysis.role_competencies === "object"
      ? analysis.role_competencies
      : {};


  const skillRecommendations =
    Array.isArray(
      analysis.skill_recommendations
    )
      ? analysis.skill_recommendations
      : [];


  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div
      id="resume-analysis-dashboard"
      className="
        mx-auto
        w-full
        max-w-7xl
        space-y-7
        bg-background
        px-4
        py-6
        sm:px-6
        lg:px-8
        lg:py-8
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <HeroHeader
        file={file}
        analysis={analysis}
      />


      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      <section>

        <div className="mb-4">

          <h2
            className="
              text-lg
              font-semibold
              tracking-tight
              text-foreground
            "
          >
            Resume overview
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            A quick summary of your resume analysis.
          </p>

        </div>


        <StatsCards
          analysis={analysis}
        />

      </section>


      {/* ======================================================
          PERFORMANCE
          ATS + SKILL COVERAGE
      ====================================================== */}

      <section>

        <div className="mb-4">

          <h2
            className="
              text-lg
              font-semibold
              tracking-tight
              text-foreground
            "
          >
            Performance
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            Understand your ATS compatibility and role skill
            coverage.
          </p>

        </div>


        {/* ====================================================
            EQUAL HEIGHT PERFORMANCE GRID
        ==================================================== */}

        <div
          className="
            grid
            items-stretch
            gap-5
            xl:grid-cols-2
          "
        >

          {/* ==================================================
              ATS COMPATIBILITY
          ================================================== */}

          <div
            className="
              flex
              h-full
              min-h-[500px]
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-card
              shadow-soft
            "
          >

            <div className="flex h-full flex-col">

              <ATSGauge
                score={
                  Number(
                    analysis.ats_score
                  ) || 0
                }
              />

            </div>

          </div>


          {/* ==================================================
              SKILL COVERAGE
          ================================================== */}

          <div
            className="
              flex
              h-full
              min-h-[500px]
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-card
              shadow-soft
            "
          >

            <div className="flex h-full flex-col">

              <SkillsChart
                skills={skills}
                missingSkills={
                  missingSkills
                }
                exactMatches={
                  exactMatches
                }
                relatedMatches={
                  relatedMatches
                }
                contextualMatches={
                  contextualMatches
                }
              />

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          ATS BREAKDOWN
      ====================================================== */}

      <section>

        <ATSBreakdown
          analysis={analysis}
        />

      </section>


      {/* ======================================================
          RESUME HEALTH
      ====================================================== */}

      <section>

        <ResumeHealth
          analysis={analysis}
        />

      </section>


      {/* ======================================================
          SKILLS + RECOMMENDATIONS
      ====================================================== */}

      <section>

        <SkillsSection
          skills={skills}
          missingSkills={
            missingSkills
          }
          exactMatches={
            exactMatches
          }
          relatedMatches={
            relatedMatches
          }
          contextualMatches={
            contextualMatches
          }
          skillGroups={
            skillGroups
          }
          groupCoverage={
            groupCoverage
          }
          roleCompetencies={
            roleCompetencies
          }
          skillRecommendations={
            skillRecommendations
          }
        />

      </section>


      {/* ======================================================
          RESUME + AI FEEDBACK
      ====================================================== */}

      <section>

        <div className="mb-4">

          <h2
            className="
              text-lg
              font-semibold
              tracking-tight
              text-foreground
            "
          >
            Resume review
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-muted-foreground
            "
          >
            Review the extracted resume and the feedback
            generated from your analysis.
          </p>

        </div>


        <div
          className="
            grid
            items-stretch
            gap-5
            xl:grid-cols-2
          "
        >

          {/* ==================================================
              RESUME PREVIEW
          ================================================== */}

          <div className="h-full">

            <ResumePreview
              resume={
                analysis.resume_text ||
                ""
              }
            />

          </div>


          {/* ==================================================
              AI FEEDBACK
          ================================================== */}

          <div className="h-full">

            <FeedbackPanel
              feedback={
                analysis.ai_feedback
              }
            />

          </div>

        </div>

      </section>


      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-border
          bg-card
          p-5
          shadow-soft
        "
      >

        <ActionButtons
          file={file}
          analysis={analysis}
        />

      </section>

    </div>
  );
}