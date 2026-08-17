import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  FileText,
  LockKeyhole,
  Moon,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
} from "lucide-react";

import { Logo } from "@/components/brand";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { theme, toggle } = useTheme();

 return (
  <div className="relative min-h-screen overflow-hidden bg-background text-foreground">

    {/* ======================================================
        BOTTOM LEFT DECORATIVE WAVE
    ====================================================== */}

    <div
      aria-hidden="true"
      className="hero-dotted-wave"
    />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="homepage-header">

        <div className="homepage-header-inner">

          {/* LOGO */}

          <Link
            to="/"
            className="shrink-0"
            aria-label="ResumeLens home"
          >
            <Logo />
          </Link>


          {/* HEADER ACTIONS */}

          <div className="homepage-header-actions">

            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="homepage-theme-button"
            >
              {theme === "dark" ? (
                <Sun className="size-5" strokeWidth={1.7} />
              ) : (
                <Moon className="size-5" strokeWidth={1.7} />
              )}
            </button>


            <Link
              to="/login"
              className="homepage-signin"
            >
              Sign in
            </Link>


            <Link
              to="/signup"
              className="homepage-signup"
            >
              Sign up
            </Link>

          </div>

        </div>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <main className="homepage-main">

        <section className="homepage-hero">

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div className="homepage-copy">

            <div className="homepage-eyebrow">

              <span className="homepage-eyebrow-dot" />

              <span>
                Resume analysis made practical
              </span>

            </div>


            <h1 className="homepage-title">

              Build a resume that

              <span className="homepage-title-accent">
                gets noticed.
              </span>

            </h1>


            <p className="homepage-description">
              Understand your ATS score, discover missing skills,
              and get practical recommendations before you apply.
            </p>


            {/* BUTTONS */}

            <div className="homepage-buttons">

              <Link
                to="/login"
                className="homepage-primary-button"
              >
                Analyze my resume

                <ArrowRight
                  className="size-5"
                  strokeWidth={1.8}
                />
              </Link>


              <a
                href="#how-it-works"
                className="homepage-secondary-button"
              >
                See how it works
              </a>

            </div>


            {/* TRUST ITEMS */}

            <div className="homepage-trust">

              <div className="homepage-trust-item">

                <FileText
                  className="size-5"
                  strokeWidth={1.7}
                />

                <span>
                  PDF resume analysis
                </span>

              </div>


              <div className="homepage-trust-item">

                <ShieldCheck
                  className="size-5"
                  strokeWidth={1.7}
                />

                <span>
                  Private &amp; secure
                </span>

              </div>


              <div className="homepage-trust-item">

                <ScanLine
                  className="size-5"
                  strokeWidth={1.7}
                />

                <span>
                  ATS focused
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              ANALYSIS PREVIEW
          ================================================= */}

          <div className="homepage-analysis">

            {/* TOP HEADER */}

            <div className="analysis-header">

              <div className="analysis-title-group">

                <div className="analysis-file-icon">

                  <FileText
                    className="size-7"
                    strokeWidth={1.7}
                  />

                </div>


                <div>

                  <h2 className="analysis-title">
                    Resume analysis
                  </h2>

                  <p className="analysis-subtitle">
                    Software Developer Resume.pdf
                  </p>

                </div>

              </div>


              <div className="analysis-complete">
                <span className="analysis-complete-icon">
                  ✓
                </span>

                Complete
              </div>

            </div>


            {/* SCORE CARDS */}

            <div className="analysis-score-grid">

              <ScoreCard
                title="ATS Score"
                score="83"
                description="Good compatibility"
                icon={
                  <ScanLine
                    className="size-6"
                    strokeWidth={1.7}
                  />
                }
                progress="83%"
              />


              <ScoreCard
                title="Skills"
                score="12"
                description="Skills detected"
                icon={
                  <Sparkles
                    className="size-6"
                    strokeWidth={1.7}
                  />
                }
                progress="22%"
              />


              <ScoreCard
                title="Role match"
                score="91"
                description="Strong alignment"
                icon={
                  <TrendingUp
                    className="size-6"
                    strokeWidth={1.7}
                  />
                }
                progress="91%"
              />

            </div>


            {/* LOWER CARDS */}

            <div className="analysis-lower-grid">

              {/* RESUME OVERVIEW */}

              <div className="analysis-panel">

                <div className="analysis-panel-heading">

                  <FileText
                    className="size-6"
                    strokeWidth={1.7}
                  />

                  <span>
                    Resume overview
                  </span>

                </div>


                <div className="resume-lines">

                  <div className="resume-line w-[88%]" />
                  <div className="resume-line w-[72%]" />
                  <div className="resume-line w-[80%]" />
                  <div className="resume-line w-[58%]" />
                  <div className="resume-line w-[68%]" />

                </div>


                <div className="analysis-info-box">

                  Clear structure with relevant
                  technical experience and education.

                </div>

              </div>


              {/* FEEDBACK */}

              <div className="analysis-panel">

                <div className="analysis-panel-heading">

                  <Sparkles
                    className="size-6"
                    strokeWidth={1.7}
                  />

                  <span>
                    Key feedback
                  </span>

                </div>


                <div className="feedback-list">

                  <FeedbackItem
                    type="success"
                    text="Strong programming foundation"
                  />

                  <FeedbackItem
                    type="info"
                    text="Relevant technical projects"
                  />

                  <FeedbackItem
                    type="warning"
                    text="Add measurable project impact"
                  />

                </div>

              </div>

            </div>


            {/* RECOMMENDED DIRECTION */}

            <div className="analysis-recommendation">

              <div>

                <p className="recommendation-title">
                  Recommended direction
                </p>

                <p className="recommendation-description">
                  Based on skills found in your resume
                </p>

              </div>


              <div className="recommendation-tag">

                Software Development

                <ArrowRight
                  className="size-5"
                  strokeWidth={1.7}
                />

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            HOW IT WORKS
        =================================================== */}

        <section
          id="how-it-works"
          className="homepage-how"
        >

          <div className="homepage-how-inner">

            <div>

              <p className="homepage-section-label">
                HOW IT WORKS
              </p>

              <h2 className="homepage-section-title">
                A clearer way to improve your resume.
              </h2>

            </div>


            <div className="homepage-how-grid">

              <HowStep
                number="01"
                title="Upload your resume"
                description="Upload your PDF resume and let ResumeLens extract the important information."
              />

              <HowStep
                number="02"
                title="Get your analysis"
                description="Review your ATS score, skills, role match and resume structure."
              />

              <HowStep
                number="03"
                title="Improve with confidence"
                description="Use practical recommendations to strengthen your resume before applying."
              />

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


/* ============================================================
   SCORE CARD
============================================================ */

function ScoreCard({
  title,
  score,
  description,
  icon,
  progress,
}: {
  title: string;
  score: string;
  description: string;
  icon: React.ReactNode;
  progress: string;
}) {
  return (
    <div className="analysis-score-card">

      <div className="score-card-top">

        <span>
          {title}
        </span>

        <div className="score-card-icon">
          {icon}
        </div>

      </div>


      <div className="score-value">

        {score}

        <span>
          /100
        </span>

      </div>


      <div className="score-progress">

        <div
          className="score-progress-value"
          style={{
            width: progress,
          }}
        />

      </div>


      <p className="score-description">
        {description}
      </p>

    </div>
  );
}


/* ============================================================
   FEEDBACK ITEM
============================================================ */

function FeedbackItem({
  type,
  text,
}: {
  type: "success" | "info" | "warning";
  text: string;
}) {
  return (
    <div
      className={`feedback-item feedback-${type}`}
    >

      <span className="feedback-dot" />

      <span>
        {text}
      </span>

    </div>
  );
}


/* ============================================================
   HOW STEP
============================================================ */

function HowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="how-step">

      <span className="how-number">
        {number}
      </span>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

    </div>
  );
}