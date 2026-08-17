import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Error 404
        </p>

        <h1 className="mt-4 text-3xl font-semibold text-foreground">
          This page doesn't exist
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The link may be outdated or the page has been moved.
        </p>

        <div className="mt-8">
          <Link
            to="/"
            className="bg-brand ring-focus inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]"
          >
            Back to ResumeLens
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Try again or head back home.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-brand inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>

          <a
            href="/"
            className="hairline inline-flex h-10 items-center justify-center rounded-lg bg-surface px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route =
  createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: "ResumeLens — AI Resume Analyzer",
        },
        {
          name: "description",
          content:
            "ResumeLens analyzes your resume against ATS systems and hiring signals so you get shortlisted faster.",
        },
        {
          property: "og:title",
          content: "ResumeLens — AI Resume Analyzer",
        },
        {
          property: "og:description",
          content:
            "Professional AI-powered resume analysis for candidates who want interviews.",
        },
        {
          property: "og:type",
          content: "website",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
      ],

      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap",
        },
        {
          rel: "icon",
          href: "/logoo.ico",
          type: "image/x-icon",
        },
      ],
    }),

    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  });

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>

      <body>
        {children}

        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const googleClientId =
  (import.meta.env as Record<string, string | undefined>)[
    "VITE_GOOGLE_CLIENT_ID"
  ];

  return (
    <GoogleOAuthProvider clientId={googleClientId ?? ""}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Outlet />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}