import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand";

export const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

export function AuthShell({
  children,
  heading,
  copy,
  panel,
}: {
  children: ReactNode;
  heading: ReactNode;
  copy: ReactNode;
  panel?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">

      <div
        className="
          mx-auto
          min-h-screen
          w-full
          max-w-[1380px]
          px-6
          py-8
          lg:px-10
        "
      >

        {/* ==================================================
            LOGO
        ================================================== */}

        <div className="mb-10">

          <Link
            to="/"
            className="inline-flex items-center"
          >
            <Logo />
          </Link>

        </div>


        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <div
          className="
            grid
            items-start
            gap-10
            lg:grid-cols-[minmax(0,1fr)_660px]
            lg:gap-12
            xl:grid-cols-[520px_680px]
            xl:gap-[70px]
          "
        >

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <section
            className="
              pt-16
              lg:pt-24
              xl:pt-28
            "
          >

            <div className="max-w-[500px]">

              {/* ------------------------------------------------
                  HEADING
              ------------------------------------------------ */}

              <h1
                className="
                  text-4xl
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.035em]
                  text-foreground
                  sm:text-[42px]
                  lg:text-[44px]
                "
              >
                {heading}
              </h1>


              {/* ------------------------------------------------
                  DESCRIPTION
              ------------------------------------------------ */}

              <div
                className="
                  mt-5
                  max-w-[470px]
                  text-[15px]
                  leading-6
                  text-muted-foreground
                  sm:text-[16px]
                "
              >
                {copy}
              </div>


              {/* ------------------------------------------------
                  BENEFIT PANEL
              ------------------------------------------------ */}

              {panel && (
                <div className="mt-10">
                  {panel}
                </div>
              )}

            </div>

          </section>


          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <section
            className="
              w-full
              rounded-[24px]
              border
              border-border
              bg-card
              p-7
              shadow-soft
              sm:p-8
              lg:p-9
            "
          >

            <div className="w-full">
              {children}
            </div>

          </section>

        </div>

      </div>

    </div>
  );
}