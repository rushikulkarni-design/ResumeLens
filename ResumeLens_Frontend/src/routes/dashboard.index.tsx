import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import {
  UploadPanel,
  AnalyzingPanel,
  type UploadedFile,
} from "@/components/dashboard/upload-panel";

import AnalysisDashboard from "@/components/dashboard/analysis-dashboard/AnalysisDashboard";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      {
        title: "Dashboard — ResumeLens",
      },
      {
        name: "description",
        content:
          "Upload a resume and get ATS score, keyword gaps and role-matched AI feedback.",
      },
      {
        property: "og:title",
        content: "Dashboard — ResumeLens",
      },
      {
        property: "og:description",
        content:
          "Your ResumeLens analysis workspace: upload, score, improve.",
      },
    ],
  }),

  component: DashboardHome,
});

function DashboardHome() {
  const [stage, setStage] = useState<
    "upload" | "analyzing" | "done"
  >("upload");

  const [file, setFile] =
    useState<UploadedFile | null>(null);

  const [analysis, setAnalysis] =
    useState<any>(null);

  /*
   * Load an analysis selected from History.
   */
  useEffect(() => {
    const savedAnalysis =
      sessionStorage.getItem("selected_analysis");

    if (!savedAnalysis) {
      return;
    }

    try {
      const data = JSON.parse(savedAnalysis);

      const savedFile: UploadedFile = {
        name: data.name || "Resume.pdf",
        size: data.size || "",
      };

      setFile(savedFile);
      setAnalysis(data);
      setStage("done");

      sessionStorage.removeItem(
        "selected_analysis"
      );
    } catch (error) {
      console.error(
        "Failed to load selected analysis:",
        error
      );

      sessionStorage.removeItem(
        "selected_analysis"
      );
    }
  }, []);

  return (
    <AnimatePresence mode="wait">

      {/* =====================================================
          UPLOAD STAGE
      ===================================================== */}

      {stage === "upload" && (
        <motion.div
          key="upload"
          initial={{
            opacity: 1,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
            y: -8,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          <UploadPanel
            onAnalyzing={(selectedFile) => {
              setFile(selectedFile);
              setStage("analyzing");
            }}
            onReady={(selectedFile, data) => {
              /*
               * The API has finished.
               *
               * Keep the complete API response intact.
               * This is important for:
               *
               * ats_score
               * ai_feedback
               * skills
               * role_skill_coverage
               * score_breakdown
               * etc.
               */

              console.log(
                "========== FINAL ANALYSIS =========="
              );

              console.log(
                "Full analysis:",
                data
              );

              console.log(
                "AI feedback:",
                data?.ai_feedback
              );

              console.log(
                "AI resume score:",
                data?.ai_feedback?.resume_score
              );

              console.log(
                "ATS score:",
                data?.ats_score
              );

              console.log(
                "===================================="
              );

              setFile(selectedFile);
              setAnalysis(data);
              setStage("done");
            }}
          />
        </motion.div>
      )}

      {/* =====================================================
          ANALYZING STAGE
      ===================================================== */}

      {stage === "analyzing" && file && (
        <motion.div
          key="analyzing"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          <AnalyzingPanel
            fileName={file.name}
          />
        </motion.div>
      )}

      {/* =====================================================
          COMPLETED ANALYSIS
      ===================================================== */}

      {stage === "done" &&
        file &&
        analysis && (
          <motion.div
            key="done"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.4,
            }}
          >
            <AnalysisDashboard
              file={file}
              analysis={analysis}
            />
          </motion.div>
        )}

    </AnimatePresence>
  );
}