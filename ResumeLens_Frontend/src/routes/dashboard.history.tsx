import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { motion } from "motion/react";

import {
  FileText,
  MoreHorizontal,
  ArrowUpRight,
  Search,
  Share2,
  Download,
  Trash2,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({
    meta: [
      { title: "Analysis history — ResumeLens" },
      {
        name: "description",
        content:
          "Every resume version you analyzed, with its ATS score and upload date.",
      },
    ],
  }),

  component: HistoryPage,
});

function scoreTone(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 70) return "text-primary";
  return "text-warning";
}

function HistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Which three-dot menu is open
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  // Which resume is waiting for delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
          setHistory([]);
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:8000/history/${userId}`
        );

        setHistory(response.data);
      } catch (error) {
        console.error("Failed to load history:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const bestScore =
    history.length > 0
      ? Math.max(...history.map((item) => item.score))
      : 0;

  async function openAnalysis(item: any) {
    try {
      const userId = localStorage.getItem("user_id");

      if (!userId) return;

      const response = await axios.get(
        `http://127.0.0.1:8000/history/${userId}/${item.id}`
      );

      sessionStorage.setItem(
        "selected_analysis",
        JSON.stringify(response.data)
      );

      setActiveMenu(null);

      navigate({
        to: "/dashboard",
      });
    } catch (error) {
      console.error("Failed to open analysis:", error);
    }
  }

  async function shareAnalysis(item: any) {
    const text =
      `ResumeLens Analysis\n\n` +
      `Resume: ${item.name}\n` +
      `ATS Score: ${item.score}%`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "ResumeLens Analysis",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Analysis information copied.");
      }
    } catch (error) {
      console.log("Share cancelled", error);
    }

    setActiveMenu(null);
  }

  async function downloadAnalysis(item: any) {
    try {
      const userId = localStorage.getItem("user_id");

      if (!userId) return;

      const response = await axios.get(
        `http://127.0.0.1:8000/history/${userId}/${item.id}`
      );

      const data = response.data;

      const content = `
ResumeLens Analysis
=================

Resume: ${data.name}
ATS Score: ${data.ats_score}%
Recommended Role: ${data.recommended_role}

Skills:
${(data.skills || []).join(", ")}

Missing Skills:
${(data.missing_skills || []).join(", ")}

Resume Text:
${data.resume_text || ""}
`;

      const blob = new Blob([content], {
        type: "text/plain",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `${data.name || "resume"}-analysis.txt`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }

    setActiveMenu(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      const userId = localStorage.getItem("user_id");

      if (!userId) {
        console.error("User ID not found");
        return;
      }

      await axios.delete(
        `http://127.0.0.1:8000/history/${userId}/${deleteTarget.id}`
      );

      setHistory((current) =>
        current.filter(
          (item) => item.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete analysis:", error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8"
      onClick={() => {
        if (activeMenu !== null) {
          setActiveMenu(null);
        }
      }}
    >
      {/* HEADER */}

      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold">
            Analysis history
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {history.length > 0
              ? `${history.length} ${
                  history.length === 1
                    ? "analysis"
                    : "analyses"
                } · best score ${bestScore}`
              : "Your analyzed resumes will appear here."}
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 sm:flex">
          <Search className="h-4 w-4 text-muted-foreground" />

          <span className="text-xs text-muted-foreground">
            Resume history
          </span>
        </div>
      </motion.header>

      {/* LOADING */}

      {loading && (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Loading your resume history...
          </p>
        </div>
      )}

      {/* EMPTY */}

      {!loading && history.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl border border-border bg-surface p-12 text-center"
        >
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
            <FileText className="h-7 w-7 text-primary" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            No resume analyses yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Upload your first resume to see its ATS
            score and analysis here.
          </p>
        </motion.div>
      )}

      {/* HISTORY TABLE */}

      {!loading && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.08,
          }}
          className="hairline mt-8 overflow-visible rounded-2xl bg-surface shadow-soft"
          onClick={(e) => e.stopPropagation()}
        >
          {/* TABLE HEADER */}

          <div className="hidden grid-cols-[minmax(0,1fr)_130px_120px_44px] gap-4 border-b border-border px-5 py-3 font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase sm:grid">
            <span>Resume</span>
            <span>Upload date</span>
            <span>ATS score</span>
            <span />
          </div>

          <ul className="divide-y divide-border">
            {history.map((h, i) => (
              <motion.li
                key={h.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.12 + i * 0.05,
                }}
                className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2 sm:grid-cols-[minmax(0,1fr)_130px_120px_44px]"
              >
                {/* RESUME */}

                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText
                      className="size-4"
                      strokeWidth={1.75}
                    />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">
                      {h.name}
                    </p>

                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {h.size} · PDF

                      <span className="sm:hidden">
                        {" · "}
                        {h.date}
                      </span>
                    </p>
                  </div>
                </div>

                {/* DATE */}

                <p className="hidden text-[12.5px] text-muted-foreground sm:block">
                  {h.date}
                </p>

                {/* SCORE */}

                <div className="hidden items-center gap-3 sm:flex">
                  <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(
                          Math.max(h.score, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <span
                    className={
                      "text-[12.5px] font-medium " +
                      scoreTone(h.score)
                    }
                  >
                    {h.score}
                  </span>
                </div>

                {/* ACTIONS */}

                <div className="relative flex shrink-0 items-center justify-end gap-1">
                  <span
                    className={
                      "text-[12.5px] font-medium sm:hidden " +
                      scoreTone(h.score)
                    }
                  >
                    {h.score}
                  </span>

                  {/* OPEN */}

                  <button
                    type="button"
                    aria-label="Open analysis"
                    onClick={() => openAnalysis(h)}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-accent hover:text-foreground"
                  >
                    <ArrowUpRight className="size-4" />
                  </button>

                  {/* THREE DOTS */}

                  <button
                    type="button"
                    aria-label="More actions"
                    onClick={(e) => {
                      e.stopPropagation();

                      setActiveMenu(
                        activeMenu === h.id
                          ? null
                          : h.id
                      );
                    }}
                    className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>

                  {/* ACTION MENU */}

                  {activeMenu === h.id && (
                    <div
                      className="absolute right-0 top-10 z-[60] w-48 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-2xl"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          openAnalysis(h)
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        Open analysis
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          shareAnalysis(h)
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          downloadAnalysis(h)
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>

                      <div className="my-1 border-t border-border" />

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenu(null);
                          setDeleteTarget(h);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* DELETE MODAL */}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
          onClick={() => {
            if (!deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-destructive/10">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>

              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Delete analysis?
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                "{deleteTarget.name}"
              </span>
              ?
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              This action cannot be undone.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="rounded-xl bg-destructive px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}