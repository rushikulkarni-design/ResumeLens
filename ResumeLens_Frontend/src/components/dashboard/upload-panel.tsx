import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { motion } from "motion/react";

import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ShieldCheck,
  BriefcaseBusiness,
  Search,
  ChevronDown,
} from "lucide-react";

import { toast } from "sonner";
import axios from "axios";

/* ============================================================
   TYPES
============================================================ */

export type UploadedFile = {
  name: string;
  size: string;
};

interface UploadPanelProps {
  /*
   * Called immediately before the API analysis starts.
   */
  onAnalyzing: (
    file: UploadedFile
  ) => void;

  /*
   * Called after the API analysis successfully finishes.
   */
  onReady: (
    file: UploadedFile,
    analysis: any
  ) => void;
}

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

/* ============================================================
   UPLOAD PANEL
============================================================ */

export function UploadPanel({
  onAnalyzing,
  onReady,
}: UploadPanelProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [dragging, setDragging] =
    useState(false);

  const [file, setFile] =
    useState<UploadedFile | null>(null);

  const [jobTitles, setJobTitles] =
    useState<string[]>([]);

  const [jobTitle, setJobTitle] =
    useState("");

  const [jobSearch, setJobSearch] =
    useState("");

  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  const [loadingJobs, setLoadingJobs] =
    useState(true);

  const [analyzing, setAnalyzing] =
    useState(false);

  /* ==========================================================
     LOAD JOB TITLES
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadJobTitles() {
      try {
        const response =
          await axios.get(
            "http://127.0.0.1:8000/job-titles"
          );

        const titles =
          response.data?.job_titles;

        if (
          mounted &&
          Array.isArray(titles)
        ) {
          const sortedTitles =
            [...titles]
              .filter(
                (title): title is string =>
                  typeof title === "string"
              )
              .sort((a, b) =>
                a.localeCompare(
                  b,
                  undefined,
                  {
                    sensitivity: "base",
                  }
                )
              );

          setJobTitles(sortedTitles);
        }
      } catch (error) {
        console.error(
          "Failed to load job titles:",
          error
        );

        if (mounted) {
          setJobTitles([]);

          toast.error(
            "Unable to load job titles.",
            {
              description:
                "Please make sure the backend server is running.",
            }
          );
        }
      } finally {
        if (mounted) {
          setLoadingJobs(false);
        }
      }
    }

    loadJobTitles();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     FILTER JOB TITLES
  ========================================================== */

  const filteredJobTitles =
    jobTitles.filter((title) =>
      title
        .toLowerCase()
        .includes(
          jobSearch
            .toLowerCase()
            .trim()
        )
    );

  /* ==========================================================
     SELECT JOB TITLE
  ========================================================== */

  const handleJobSelect = (
    title: string
  ) => {
    setJobTitle(title);
    setJobSearch("");
    setDropdownOpen(false);

    /*
     * If the user changes the role after selecting
     * a resume, clear the selected resume.
     *
     * This prevents accidentally analyzing a resume
     * under a different role without explicitly
     * selecting the file again.
     */
    setFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  /* ==========================================================
     PDF VALIDATION
  ========================================================== */

  const validatePdf = (
    selectedFile: File
  ): boolean => {
    const fileName =
      selectedFile.name.toLowerCase();

    const hasPdfExtension =
      fileName.endsWith(".pdf");

    const hasPdfMimeType =
      selectedFile.type ===
      "application/pdf";

    /*
     * Accept valid PDF extension OR PDF MIME type.
     *
     * Some browsers provide an empty MIME type,
     * so extension checking is also required.
     */
    if (
      !hasPdfExtension &&
      !hasPdfMimeType
    ) {
      toast.error(
        "Unsupported file",
        {
          description:
            "Please upload a PDF file.",
        }
      );

      return false;
    }

    if (
      selectedFile.size <= 0
    ) {
      toast.error(
        "Invalid PDF",
        {
          description:
            "The selected file appears to be empty.",
        }
      );

      return false;
    }

    if (
      selectedFile.size >
      MAX_FILE_SIZE
    ) {
      toast.error(
        "File too large",
        {
          description:
            "Please upload a PDF smaller than 10 MB.",
        }
      );

      return false;
    }

    return true;
  };

  /* ==========================================================
     ANALYZE FILE
  ========================================================== */

  const analyzeFile = async (
    selectedFile: File,
    pickedFile: UploadedFile,
    selectedJobTitle: string
  ) => {
    if (!selectedJobTitle) {
      toast.error(
        "Select a job title first",
        {
          description:
            "Choose the target role before analyzing your resume.",
        }
      );

      return;
    }

    setAnalyzing(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      /* -------------------------------------------------------
         USER ID
      ------------------------------------------------------- */

      const userId =
        localStorage.getItem(
          "user_id"
        );

      if (!userId) {
        toast.error(
          "Please login again",
          {
            description:
              "Your user session could not be found.",
          }
        );

        setFile(null);
        setAnalyzing(false);

        return;
      }

      formData.append(
        "user_id",
        userId
      );

      /* -------------------------------------------------------
         JOB TITLE
      ------------------------------------------------------- */

      formData.append(
        "job_title",
        selectedJobTitle
      );

      /* -------------------------------------------------------
         API REQUEST
      ------------------------------------------------------- */

      console.log(
        "========== STARTING ANALYSIS =========="
      );

      console.log(
        "Job title:",
        selectedJobTitle
      );

      console.log(
        "File:",
        selectedFile.name
      );

      console.log(
        "========================================"
      );

      const response =
        await axios.post(
          "http://127.0.0.1:8000/analyze",
          formData
        );

      const data =
        response.data;

      /* -------------------------------------------------------
         API DEBUG
      ------------------------------------------------------- */

      console.log(
        "========== API RESPONSE =========="
      );

      console.log(
        "Full response:",
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
        "Skills:",
        data?.skills
      );

      console.log(
        "Role:",
        data?.job_title
      );

      console.log(
        "=================================="
      );

      /* -------------------------------------------------------
         BASIC RESPONSE VALIDATION
      ------------------------------------------------------- */

      if (
        !data ||
        typeof data !== "object"
      ) {
        throw new Error(
          "The analysis server returned an invalid response."
        );
      }

      /*
       * Send the COMPLETE API response to the dashboard.
       *
       * Nothing is removed or modified here.
       */
      onReady(
        pickedFile,
        data
      );

    } catch (error) {
      console.error(
        "Resume analysis failed:",
        error
      );

      setFile(null);

      let message =
        "Unable to analyze your resume. Please try again.";

      if (
        axios.isAxiosError(error)
      ) {
        const backendDetail =
          error.response?.data?.detail;

        if (
          typeof backendDetail ===
            "string" &&
          backendDetail.trim()
        ) {
          message =
            backendDetail;
        }
      } else if (
        error instanceof Error &&
        error.message
      ) {
        message =
          error.message;
      }

      toast.error(
        "Analysis failed",
        {
          description:
            message,
        }
      );
    } finally {
      setAnalyzing(false);

      /*
       * Allows the same PDF to be selected again.
       */
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  /* ==========================================================
     ACCEPT FILE
  ========================================================== */

  const accept = useCallback(
    async (
      selectedFile:
        | File
        | undefined
    ) => {
      if (!selectedFile) {
        return;
      }

      /* -------------------------------------------------------
         ROLE MUST BE SELECTED FIRST
      ------------------------------------------------------- */

      if (!jobTitle) {
        toast.error(
          "Select a job title first",
          {
            description:
              "Choose your target role before uploading your resume.",
          }
        );

        if (inputRef.current) {
          inputRef.current.value = "";
        }

        return;
      }

      /* -------------------------------------------------------
         VALIDATE PDF
      ------------------------------------------------------- */

      if (
        !validatePdf(
          selectedFile
        )
      ) {
        if (inputRef.current) {
          inputRef.current.value = "";
        }

        return;
      }

      /* -------------------------------------------------------
         CREATE DISPLAY FILE
      ------------------------------------------------------- */

      const pickedFile:
        UploadedFile = {
        name:
          selectedFile.name,

        size: `${Math.max(
          1,
          Math.round(
            selectedFile.size /
              1024
          )
        )} KB`,
      };

      setFile(pickedFile);

      /*
       * IMPORTANT:
       *
       * Tell the parent that analysis is starting.
       *
       * The parent switches to the analyzing screen.
       */
      onAnalyzing(
        pickedFile
      );

      /*
       * IMPORTANT:
       *
       * There is ONLY ONE API call here.
       */
      await analyzeFile(
        selectedFile,
        pickedFile,
        jobTitle
      );
    },
    [
      jobTitle,
      onAnalyzing,
    ]
  );

  /* ==========================================================
     DRAG & DROP
  ========================================================== */

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setDragging(false);

    if (!jobTitle) {
      toast.error(
        "Select a job title first",
        {
          description:
            "Choose your target role before uploading your resume.",
        }
      );

      return;
    }

    void accept(
      event.dataTransfer.files?.[0]
    );
  };

  /* ==========================================================
     ANALYZING VIEW
  ========================================================== */

  if (
    analyzing &&
    file
  ) {
    return (
      <AnalyzingPanel
        fileName={file.name}
      />
    );
  }

  /* ==========================================================
     MAIN UI
  ========================================================== */

  return (
    <div className="pt-12 text-center">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
      >
        <h2 className="text-2xl font-bold">
          Upload your resume
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Select your target job role first,
          then upload your PDF resume for
          analysis.
        </p>
      </motion.div>

      {/* =====================================================
          JOB TITLE
      ===================================================== */}

      <div className="mx-auto mt-8 w-full max-w-xl text-left">

        <label className="mb-2 block text-sm font-semibold">
          Target Job Title
        </label>

        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setDropdownOpen(
                (previous) =>
                  !previous
              )
            }
            className="flex h-14 w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 text-left transition hover:border-primary/50"
          >

            <BriefcaseBusiness className="h-5 w-5 shrink-0 text-primary" />

            <span
              className={
                jobTitle
                  ? "flex-1 text-sm"
                  : "flex-1 text-sm text-muted-foreground"
              }
            >
              {jobTitle ||
                "Select your target job title"}
            </span>

            <ChevronDown
              className={
                "h-5 w-5 shrink-0 text-muted-foreground transition-transform " +
                (
                  dropdownOpen
                    ? "rotate-180"
                    : ""
                )
              }
            />

          </button>

          {/* =================================================
              JOB DROPDOWN
          ================================================= */}

          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">

              {/* SEARCH */}

              <div className="border-b border-border p-2">

                <div className="relative">

                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="text"
                    autoFocus
                    value={
                      jobSearch
                    }
                    onChange={(
                      event
                    ) =>
                      setJobSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search job title..."
                    className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                </div>

              </div>

              {/* OPTIONS */}

              <div className="max-h-64 overflow-y-auto p-2">

                {loadingJobs && (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    Loading job titles...
                  </p>
                )}

                {!loadingJobs &&
                  filteredJobTitles.length >
                    0 &&
                  filteredJobTitles.map(
                    (title) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() =>
                          handleJobSelect(
                            title
                          )
                        }
                        className={
                          "w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-muted " +
                          (
                            jobTitle ===
                            title
                              ? "bg-primary/10 text-primary"
                              : ""
                          )
                        }
                      >
                        {title}
                      </button>
                    )
                  )}

                {!loadingJobs &&
                  filteredJobTitles.length ===
                    0 && (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No job title found.
                    </p>
                  )}

              </div>

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          UPLOAD BOX
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.98,
        }}
        animate={{
          opacity:
            jobTitle
              ? 1
              : 0.65,
          scale: 1,
        }}
        transition={{
          duration: 0.4,
        }}
        onDragOver={(event) => {
          event.preventDefault();

          if (jobTitle) {
            setDragging(true);
          }
        }}
        onDragLeave={() =>
          setDragging(false)
        }
        onDrop={
          handleDrop
        }
        className={
          "sweep-border glass mx-auto mt-8 w-full max-w-3xl rounded-3xl p-8 text-center shadow-lift transition-all sm:p-12 " +
          (
            dragging
              ? "bg-accent/60"
              : ""
          ) +
          (
            !jobTitle
              ? " cursor-not-allowed"
              : ""
          )
        }
      >

        {/* ===================================================
            UPLOAD CONTENT
        =================================================== */}

        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">

          <UploadCloud
            className="size-7"
            strokeWidth={1.6}
          />

        </span>

        <p className="mt-6 text-[15px] font-medium">
          {jobTitle
            ? "Drag & drop your resume here"
            : "Select a target job title first"}
        </p>

        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {jobTitle
            ? "PDF up to 10 MB"
            : "Resume upload will be enabled after selecting a role"}
        </p>

        {/* =================================================
            CHOOSE RESUME
        ================================================= */}

        <button
          type="button"
          disabled={
            !jobTitle ||
            loadingJobs
          }
          onClick={() => {

            if (!jobTitle) {
              toast.error(
                "Select a job title first",
                {
                  description:
                    "Choose your target role before uploading your resume.",
                }
              );

              return;
            }

            inputRef.current?.click();
          }}
          className={
            "bg-brand ring-focus mt-7 inline-flex h-10 items-center rounded-xl px-5 text-[13.5px] font-medium text-primary-foreground shadow-soft transition-all " +
            (
              !jobTitle ||
              loadingJobs
                ? "cursor-not-allowed opacity-40"
                : "hover:scale-[1.02]"
            )
          }
        >
          Choose Resume
        </button>

        {/* =================================================
            FILE INPUT
        ================================================= */}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          hidden
          disabled={
            !jobTitle
          }
          onChange={(
            event
          ) => {
            void accept(
              event.target.files?.[0]
            );
          }}
        />

      </motion.div>

      {/* =====================================================
          PRIVACY
      ===================================================== */}

      <p className="mt-7 flex items-center justify-center gap-2 text-[12px] text-muted-foreground">

        <ShieldCheck className="size-3.5" />

        Processed in memory.
        Never used for model training.

      </p>

    </div>
  );
}

/* ============================================================
   ANALYZING PANEL
============================================================ */

export function AnalyzingPanel({
  fileName,
}: {
  fileName: string;
}) {
  const steps = [
    "Extracting text layers",
    "Simulating ATS parse",
    "Scoring against role",
    "Composing feedback",
  ];

  return (
    <div className="mx-auto max-w-3xl pt-12 text-center">

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >

        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">

          <FileText className="size-7" />

        </div>

        <h2 className="mt-6 text-xl font-semibold">
          Analyzing {fileName}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          This usually takes a few seconds.
        </p>

      </motion.div>

      <ul className="mx-auto mt-8 max-w-md space-y-2">

        {steps.map(
          (step, index) => (
            <motion.li
              key={step}
              initial={{
                opacity: 0,
                x: 8,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay:
                  0.35 * index,
                duration: 0.4,
              }}
              className="hairline flex items-center gap-3 rounded-xl bg-surface/60 px-4 py-2.5 text-left text-[12.5px] text-muted-foreground"
            >

              <motion.span
                className="size-1.5 shrink-0 rounded-full bg-primary"
                animate={{
                  opacity: [
                    0.3,
                    1,
                    0.3,
                  ],
                }}
                transition={{
                  repeat:
                    Infinity,
                  duration: 1.4,
                  delay:
                    0.2 * index,
                }}
              />

              {step}

            </motion.li>
          )
        )}

      </ul>

    </div>
  );
}