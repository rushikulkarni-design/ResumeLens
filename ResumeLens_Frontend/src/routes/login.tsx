import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { toast } from "sonner";
import axios from "axios";

import { Logo } from "@/components/brand";


/* ============================================================
   GOOGLE TYPES
============================================================ */

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (
      response: GoogleCredentialResponse
    ) => void;
  }) => void;

  renderButton: (
    element: HTMLElement,
    options: {
      theme?: string;
      size?: string;
      width?: number;
      text?: string;
      shape?: string;
    }
  ) => void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

interface GoogleGlobal {
  accounts: GoogleAccounts;
}

declare global {
  interface Window {
    google?: GoogleGlobal;
  }
}


/* ============================================================
   GOOGLE CONFIG
============================================================ */

const GOOGLE_CLIENT_ID =
  import.meta.env["VITE_GOOGLE_CLIENT_ID"] as
    | string
    | undefined;


/* ============================================================
   ROUTE
============================================================ */

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      {
        title: "Sign in — ResumeLens",
      },
      {
        name: "description",
        content:
          "Sign in to ResumeLens to analyze your resume and track your ATS score over time.",
      },
      {
        property: "og:title",
        content: "Sign in — ResumeLens",
      },
      {
        property: "og:description",
        content:
          "Access your ResumeLens resume analysis workspace.",
      },
    ],
  }),

  component: LoginPage,
});


/* ============================================================
   INPUT STYLE
============================================================ */

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";


/* ============================================================
   FIELD COMPONENT
============================================================ */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">

      <div className="flex items-center justify-between gap-3">

        <label className="text-[13px] font-medium text-foreground">
          {label}
        </label>

        {hint && (
          <div className="text-xs text-muted-foreground">
            {hint}
          </div>
        )}

      </div>

      {children}

    </div>
  );
}


/* ============================================================
   LOGIN PAGE
============================================================ */

function LoginPage() {

  const navigate = useNavigate();


  /* ----------------------------------------------------------
     LOGIN STATE
  ---------------------------------------------------------- */

  const [show, setShow] =
    useState(false);

  const [pending, setPending] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");


  /* ----------------------------------------------------------
     GOOGLE BUTTON REF
  ---------------------------------------------------------- */

  const googleButtonRef =
    useRef<HTMLDivElement>(null);


  /* ==========================================================
     GOOGLE LOGIN SUCCESS
  ========================================================== */

  async function handleGoogleSuccess(
    response: GoogleCredentialResponse
  ) {

    if (!response?.credential) {

      toast.error(
        "Google authentication failed."
      );

      return;
    }


    try {

      setGoogleLoading(true);


      /* ------------------------------------------------------
         SEND GOOGLE CREDENTIAL TO BACKEND
      ------------------------------------------------------ */

      const result =
        await axios.post(
          "http://127.0.0.1:8000/google-login",
          {
            credential:
              response.credential,
          },
        );


      /* ------------------------------------------------------
         GET USER
      ------------------------------------------------------ */

      const user =
        result.data?.user;


      if (!user?.id) {

        throw new Error(
          "Google login response did not contain a user ID."
        );

      }


      /* ------------------------------------------------------
         STORE USER
      ------------------------------------------------------ */

      localStorage.setItem(
        "user",
        JSON.stringify(user),
      );


      localStorage.setItem(
        "user_id",
        String(user.id),
      );


      /* ------------------------------------------------------
         STORE TOKEN IF BACKEND RETURNS ONE
      ------------------------------------------------------ */

      if (result.data?.token) {

        localStorage.setItem(
          "token",
          String(
            result.data.token,
          ),
        );

      } else if (
        result.data?.access_token
      ) {

        localStorage.setItem(
          "token",
          String(
            result.data.access_token,
          ),
        );

      }


      /* ------------------------------------------------------
         SUCCESS
      ------------------------------------------------------ */

      toast.success(
        result.data?.message ||
          "Google login successful.",
      );


      navigate({
        to: "/dashboard",
      });

    } catch (error: unknown) {

      console.error(
        "Google login error:",
        error,
      );


      const axiosError =
        axios.isAxiosError(error)
          ? error
          : null;


      const detail =
        axiosError?.response?.data
          ?.detail ||
        axiosError?.response?.data
          ?.message;


      toast.error(
        String(
          detail ||
            "Unable to sign in with Google. Please try again.",
        ),
      );

    } finally {

      setGoogleLoading(false);

    }

  }


  /* ==========================================================
     INITIALIZE GOOGLE IDENTITY SERVICES
  ========================================================== */

  useEffect(() => {

    /* --------------------------------------------------------
       CHECK GOOGLE CLIENT ID
    -------------------------------------------------------- */

    if (!GOOGLE_CLIENT_ID) {

      console.error(
        "VITE_GOOGLE_CLIENT_ID is missing.",
      );

      return;

    }


    const scriptId =
      "google-identity-services";


    /* --------------------------------------------------------
       GOOGLE INITIALIZATION
    -------------------------------------------------------- */

    const initializeGoogle = () => {

      const container =
        googleButtonRef.current;


      if (
        !window.google ||
        !container
      ) {

        return;

      }


      /* ------------------------------------------------------
         INITIALIZE GOOGLE
      ------------------------------------------------------ */

      window.google.accounts.id.initialize({
        client_id:
          GOOGLE_CLIENT_ID,

        callback:
          handleGoogleSuccess,
      });


      /* ------------------------------------------------------
         CLEAR OLD BUTTON
      ------------------------------------------------------ */

      container.innerHTML = "";


      /* ------------------------------------------------------
         RENDER GOOGLE BUTTON
      ------------------------------------------------------ */

      window.google.accounts.id.renderButton(
        container,
        {
          theme: "outline",
          size: "large",
          width: 400,
          text: "continue_with",
          shape: "rectangular",
        },
      );

    };


    /* --------------------------------------------------------
       CHECK IF SCRIPT ALREADY EXISTS
    -------------------------------------------------------- */

    const existingScript =
      document.getElementById(
        scriptId,
      ) as HTMLScriptElement | null;


    if (existingScript) {

      if (window.google) {

        initializeGoogle();

      } else {

        existingScript.addEventListener(
          "load",
          initializeGoogle,
          {
            once: true,
          },
        );

      }


      return () => {

        if (
          googleButtonRef.current
        ) {

          googleButtonRef.current.replaceChildren();

        }

      };

    }


    /* --------------------------------------------------------
       CREATE GOOGLE SCRIPT
    -------------------------------------------------------- */

    const script =
      document.createElement(
        "script",
      );


    script.id =
      scriptId;

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;

    script.defer = true;


    script.addEventListener(
      "load",
      initializeGoogle,
      {
        once: true,
      },
    );


    document.head.appendChild(
      script,
    );


    /* --------------------------------------------------------
       CLEANUP
    -------------------------------------------------------- */

    return () => {

      if (
        googleButtonRef.current
      ) {

        googleButtonRef.current.replaceChildren();

      }

    };

  }, []);


  /* ==========================================================
     NORMAL LOGIN
  ========================================================== */

  async function submit(
    e: FormEvent<HTMLFormElement>,
  ) {

    e.preventDefault();


    if (pending) {

      return;

    }


    /* --------------------------------------------------------
       EMAIL
    -------------------------------------------------------- */

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (!normalizedEmail) {

      toast.error(
        "Please enter your email.",
      );

      return;

    }


    /* --------------------------------------------------------
       GMAIL VALIDATION
    -------------------------------------------------------- */

    if (
      !/^[a-z0-9._%+-]+@gmail\.com$/.test(
        normalizedEmail,
      )
    ) {

      toast.error(
        "Please use a valid Gmail address.",
      );

      return;

    }


    /* --------------------------------------------------------
       PASSWORD
    -------------------------------------------------------- */

    if (!password) {

      toast.error(
        "Please enter your password.",
      );

      return;

    }


    /* --------------------------------------------------------
       API REQUEST
    -------------------------------------------------------- */

    try {

      setPending(true);


      const response =
        await axios.post(
          "http://127.0.0.1:8000/login",
          {
            email:
              normalizedEmail,

            password,
          },
        );


      /* ------------------------------------------------------
         USER
      ------------------------------------------------------ */

      const user =
        response.data?.user;


      if (!user?.id) {

        throw new Error(
          "Login response did not contain a user ID.",
        );

      }


      /* ------------------------------------------------------
         STORE USER
      ------------------------------------------------------ */

      localStorage.setItem(
        "user",
        JSON.stringify(user),
      );


      localStorage.setItem(
        "user_id",
        String(user.id),
      );


      /* ------------------------------------------------------
         STORE TOKEN
      ------------------------------------------------------ */

      if (
        response.data?.token
      ) {

        localStorage.setItem(
          "token",
          String(
            response.data.token,
          ),
        );

      }


      if (
        response.data?.access_token
      ) {

        localStorage.setItem(
          "token",
          String(
            response.data.access_token,
          ),
        );

      }


      /* ------------------------------------------------------
         SUCCESS
      ------------------------------------------------------ */

      toast.success(
        "Login successful",
      );


      navigate({
        to: "/dashboard",
      });

    } catch (error: unknown) {

      console.error(
        "Login error:",
        error,
      );


      const axiosError =
        axios.isAxiosError(error)
          ? error
          : null;


      const message =
        axiosError?.response?.data
          ?.detail ||
        axiosError?.response?.data
          ?.message ||
        "Invalid email or password.";


      toast.error(
        String(message),
      );

    } finally {

      setPending(false);

    }

  }


  /* ==========================================================
     PAGE
  ========================================================== */

  return (

    <div className="min-h-screen bg-background text-foreground">


      {/* ======================================================
          TOP NAVIGATION
      ====================================================== */}

      <header
        className="
          border-b
          border-border
          bg-background
        "
      >

        <div
          className="
            mx-auto
            flex
            h-16
            max-w-6xl
            items-center
            justify-between
            px-5
            sm:px-8
          "
        >

          {/* LOGO */}

          <Link
            to="/"
            className="shrink-0"
          >

            <Logo />

          </Link>


          {/* SIGN UP */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <span
              className="
                hidden
                text-sm
                text-muted-foreground
                sm:block
              "
            >
              Don't have an account?
            </span>


            <Link
              to="/signup"
              className="
                inline-flex
                h-9
                items-center
                rounded-lg
                bg-primary
                px-4
                text-sm
                font-medium
                text-primary-foreground
                transition-opacity
                hover:opacity-90
              "
            >
              Sign up
            </Link>

          </div>

        </div>

      </header>


      {/* ======================================================
          LOGIN AREA
      ====================================================== */}

      <main
        className="
          flex
          min-h-[calc(100vh-64px)]
          items-center
          justify-center
          px-5
          py-10
          sm:px-8
          lg:py-12
        "
      >

        <div
          className="
            grid
            w-full
            max-w-[1100px]
            overflow-hidden
            rounded-[24px]
            border
            border-border
            bg-card
            shadow-lift
            lg:grid-cols-2
          "
        >

          {/* ==================================================
              LEFT INFORMATION PANEL
          ================================================== */}

          <section
            className="
              hidden
              flex-col
              justify-between
              border-r
              border-border
              bg-surface
              p-10
              lg:flex
              xl:p-12
            "
          >

            <div>

              <div className="mb-12">
                <Logo />
              </div>


              <p
                className="
                  mb-4
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.16em]
                  text-primary
                "
              >
                Welcome to ResumeLens
              </p>


              <h1
                className="
                  max-w-md
                  text-4xl
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.035em]
                  text-foreground
                "
              >

                Make every

                <span className="block text-primary">
                  application count.
                </span>

              </h1>


              <p
                className="
                  mt-5
                  max-w-md
                  text-[15px]
                  leading-6
                  text-muted-foreground
                "
              >
                Analyze your resume, understand
                your ATS compatibility, discover
                missing skills, and improve your
                chances of getting noticed.
              </p>

            </div>


            {/* BENEFITS */}

            <div
              className="
                mt-12
                space-y-3
              "
            >

              {/* ATS */}

              <div
                className="
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  p-4
                "
              >

                <div className="flex gap-3">

                  <div
                    className="
                      grid
                      size-9
                      shrink-0
                      place-items-center
                      rounded-full
                      bg-primary/10
                      text-primary
                    "
                  >
                    <span className="text-sm">
                      ✓
                    </span>
                  </div>


                  <div>

                    <p className="text-sm font-medium">
                      ATS-focused analysis
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-muted-foreground
                      "
                    >
                      Understand how well your
                      resume matches recruiter
                      requirements.
                    </p>

                  </div>

                </div>

              </div>


              {/* RECOMMENDATIONS */}

              <div
                className="
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  p-4
                "
              >

                <div className="flex gap-3">

                  <div
                    className="
                      grid
                      size-9
                      shrink-0
                      place-items-center
                      rounded-full
                      bg-primary/10
                      text-primary
                    "
                  >
                    <span className="text-sm">
                      +
                    </span>
                  </div>


                  <div>

                    <p className="text-sm font-medium">
                      Practical recommendations
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-muted-foreground
                      "
                    >
                      Find missing skills and
                      clear areas for improvement.
                    </p>

                  </div>

                </div>

              </div>


              {/* SECURITY */}

              <div
                className="
                  rounded-2xl
                  border
                  border-border
                  bg-background
                  p-4
                "
              >

                <div className="flex gap-3">

                  <div
                    className="
                      grid
                      size-9
                      shrink-0
                      place-items-center
                      rounded-full
                      bg-primary/10
                      text-primary
                    "
                  >
                    <span className="text-sm">
                      🔒
                    </span>
                  </div>


                  <div>

                    <p className="text-sm font-medium">
                      Your data stays yours
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-muted-foreground
                      "
                    >
                      ResumeLens is designed
                      to keep your resume
                      analysis private.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              LOGIN FORM
          ================================================== */}

          <section
            className="
              flex
              items-center
              justify-center
              p-6
              sm:p-10
              lg:p-12
            "
          >

            <div className="w-full max-w-md">

              {/* HEADING */}

              <div className="mb-8">

                <p
                  className="
                    mb-3
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-primary
                  "
                >
                  Welcome back
                </p>


                <h2
                  className="
                    text-2xl
                    font-semibold
                    tracking-tight
                    sm:text-3xl
                  "
                >
                  Sign in to ResumeLens
                </h2>


                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-muted-foreground
                  "
                >
                  Continue where you left off
                  and improve your resume.
                </p>

              </div>


              {/* ==================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={submit}
                className="space-y-5"
              >

                {/* EMAIL */}

                <Field label="Email">

                  <div className="relative">

                    <Mail
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        size-4
                        -translate-y-1/2
                        text-muted-foreground
                      "
                    />


                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value,
                        )
                      }
                      placeholder="you@gmail.com"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      className={`${inputClass} pl-10`}
                    />

                  </div>

                </Field>


                {/* PASSWORD */}

                <Field
                  label="Password"
                  hint={
                    <Link
                      to="/forgot-password"
                      className="
                        text-xs
                        text-primary
                        transition-colors
                        hover:underline
                      "
                    >
                      Forgot password?
                    </Link>
                  }
                >

                  <div className="relative">

                    <LockKeyhole
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        size-4
                        -translate-y-1/2
                        text-muted-foreground
                      "
                    />


                    <input
                      type={
                        show
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value,
                        )
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className={`${inputClass} pl-10 pr-11`}
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShow(
                          (value) => !value,
                        )
                      }
                      aria-label={
                        show
                          ? "Hide password"
                          : "Show password"
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-muted-foreground
                        transition-colors
                        hover:text-foreground
                      "
                    >

                      {show ? (
                        <EyeOff
                          className="size-4"
                        />
                      ) : (
                        <Eye
                          className="size-4"
                        />
                      )}

                    </button>

                  </div>

                </Field>


                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={pending}
                  className="
                    inline-flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary
                    px-4
                    text-sm
                    font-medium
                    text-primary-foreground
                    shadow-soft
                    transition-all
                    hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {pending
                    ? "Signing in..."
                    : "Sign in"}

                </button>

              </form>


              {/* ==================================================
                  DIVIDER
              ================================================== */}

              <div
                className="
                  my-6
                  flex
                  items-center
                  gap-4
                "
              >

                <div className="h-px flex-1 bg-border" />

                <span
                  className="
                    text-xs
                    text-muted-foreground
                  "
                >
                  OR
                </span>

                <div className="h-px flex-1 bg-border" />

              </div>


              {/* ==================================================
                  GOOGLE LOGIN
              ================================================== */}

              <div
                className="
                  relative
                  flex
                  min-h-11
                  w-full
                  items-center
                  justify-center
                "
              >

                {googleLoading && (
                  <div
                    className="
                      absolute
                      inset-0
                      z-10
                      flex
                      items-center
                      justify-center
                      rounded-xl
                      bg-background/70
                      text-sm
                      text-muted-foreground
                    "
                  >
                    Signing in with Google...
                  </div>
                )}


                <div
                  ref={googleButtonRef}
                  className="
                    flex
                    min-h-11
                    w-full
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                  "
                />

              </div>


              {/* ==================================================
                  SIGNUP
              ================================================== */}

              <p
                className="
                  mt-7
                  text-center
                  text-xs
                  text-muted-foreground
                "
              >

                Don't have a ResumeLens account?{" "}

                <Link
                  to="/signup"
                  className="
                    font-medium
                    text-primary
                    hover:underline
                  "
                >
                  Create one
                </Link>

              </p>


            </div>

          </section>

        </div>

      </main>

    </div>
  );
}