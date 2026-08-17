import {
  FileText,
  CheckCircle,
  Upload,
  Briefcase,
} from "lucide-react";

import type { UploadedFile } from "@/components/dashboard/upload-panel";

interface Props {
  file: UploadedFile;
  analysis: any;
}

export default function HeroHeader({
  file,
  analysis,
}: Props) {
  const role =
    analysis?.job_title ||
    analysis?.recommended_role ||
    "Selected Role";

  const score = Number(
    analysis?.ats_score ?? 0
  );

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

        {/* ====================================================
            RESUME INFORMATION
        ==================================================== */}

        <div className="flex items-center gap-5">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>

          <div className="min-w-0">

            <h1 className="truncate text-2xl font-bold">
              {file.name}
            </h1>

            <p className="mt-2 text-muted-foreground">
              {file.size} • Resume analyzed successfully
            </p>

            {/* Status */}

            <div className="mt-3 flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2 text-green-500">

                <CheckCircle className="h-4 w-4" />

                <span className="text-sm">
                  Analysis Complete
                </span>

              </div>

              <span className="text-muted-foreground">
                •
              </span>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">

                <Briefcase className="h-4 w-4" />

                <span>
                  {role}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ====================================================
            SCORE + UPLOAD
        ==================================================== */}

        <div className="flex flex-wrap items-center gap-4">

          {/* ATS SCORE */}

          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3 text-center">

            <p className="text-xs text-muted-foreground">
              ATS Score
            </p>

            <p className="mt-1 text-2xl font-bold text-primary">
              {score}
              <span className="text-sm">
                /100
              </span>
            </p>

          </div>

          {/* UPLOAD AGAIN */}

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90"
          >
            <Upload className="h-5 w-5" />

            Upload Again
          </button>

        </div>

      </div>

    </div>
  );
}