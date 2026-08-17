import {
  CheckCircle2,
  FileText,
} from "lucide-react";

interface Props {
  resume: string;
}


/* ============================================================
   RESUME PREVIEW
============================================================ */

export default function ResumePreview({
  resume,
}: Props) {

  const text =
    typeof resume === "string"
      ? resume.trim()
      : "";


  return (
    <section
      className="
        flex
        h-full
        min-h-[520px]
        flex-col
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
          flex
          shrink-0
          items-center
          justify-between
          border-b
          border-border
          px-5
          py-4
        "
      >

        <div className="flex items-center gap-3">

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
            <FileText
              className="size-4"
              strokeWidth={1.8}
            />
          </div>


          <div>

            <h2
              className="
                text-sm
                font-semibold
              "
            >
              Resume preview
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-muted-foreground
              "
            >
              Extracted content from your uploaded resume.
            </p>

          </div>

        </div>


        <div
          className="
            grid
            size-7
            place-items-center
            rounded-full
            bg-primary/10
          "
        >
          <CheckCircle2
            className="
              size-4
              text-primary
            "
            strokeWidth={1.8}
          />
        </div>

      </div>


      {/* ======================================================
          RESUME CONTENT
      ====================================================== */}

      <div
        className="
          min-h-0
          flex-1
          p-5
        "
      >

        {text ? (

          <div
            className="
              h-full
              min-h-[430px]
              overflow-y-auto
              rounded-xl
              border
              border-border
              bg-background
            "
          >

            {/* PAPER */}

            <div
              className="
                min-h-full
                bg-card
                p-6
                sm:p-7
              "
            >

              <pre
                className="
                  whitespace-pre-wrap
                  break-words
                  font-sans
                  text-[13px]
                  leading-6
                  text-foreground
                "
              >
                {text}
              </pre>

            </div>

          </div>

        ) : (

          <div
            className="
              flex
              h-full
              min-h-[430px]
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-border
              bg-background/40
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
                  bg-muted
                  text-muted-foreground
                "
              >
                <FileText
                  className="size-5"
                  strokeWidth={1.5}
                />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  font-medium
                "
              >
                No resume preview available
              </p>

              <p
                className="
                  mx-auto
                  mt-1
                  max-w-xs
                  text-xs
                  leading-5
                  text-muted-foreground
                "
              >
                Upload a resume to view the
                extracted content.
              </p>

            </div>

          </div>

        )}

      </div>

    </section>
  );
}