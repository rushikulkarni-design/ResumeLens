import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  ArrowRight,
  Brain,
  Check,
  Eye,
  EyeOff,
  FileCheck2,
  X,
  Zap,
} from "lucide-react";

import { toast } from "sonner";

import axios from "axios";

import { Logo } from "@/components/brand";

import PhoneInput from "@/components/common/PhoneInput";


interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
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
   ROUTE
============================================================ */

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      {
        title: "Create your account — ResumeLens",
      },

      {
        name: "description",
        content:
          "Create a ResumeLens account to analyze your resume, identify missing skills and improve ATS readiness.",
      },

      {
        property: "og:title",
        content:
          "Create your account — ResumeLens",
      },

      {
        property: "og:description",
        content:
          "Create your ResumeLens account and start improving your resume.",
      },
    ],
  }),

  component: SignupPage,
});


/* ============================================================
   BENEFITS
============================================================ */

const benefits = [
  {
    icon: Zap,
    title: "Quick setup",
    body:
      "Create your account and start analyzing your resume in minutes.",
  },

  {
    icon: FileCheck2,
    title: "ATS focused",
    body:
      "Understand your resume's ATS compatibility and identify areas to improve.",
  },

  {
    icon: Brain,
    title: "Practical insights",
    body:
      "Get clear recommendations based on your resume, skills and experience.",
  },
];


/* ============================================================
   PASSWORD RULES
============================================================ */

const passwordRules = [
  {
    label: "At least 8 characters",
    test: (value: string) =>
      value.length >= 8,
  },

  {
    label: "One uppercase letter",
    test: (value: string) =>
      /[A-Z]/.test(value),
  },

  {
    label: "One number",
    test: (value: string) =>
      /\d/.test(value),
  },

  {
    label: "One symbol",
    test: (value: string) =>
      /[^A-Za-z0-9]/.test(value),
  },
];


/* ============================================================
   INPUT CLASS
============================================================ */

const GOOGLE_CLIENT_ID =
  (import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined);

const GOOGLE_AUTH_ENDPOINT =
  (import.meta.env["VITE_GOOGLE_AUTH_ENDPOINT"] as string | undefined) ||
  "http://127.0.0.1:8000/google";

const inputClass =
  "h-11 w-full rounded-xl border border-border " +
  "bg-background/50 px-4 text-[14px] text-foreground " +
  "placeholder:text-muted-foreground/70 outline-none " +
  "transition-all duration-200 " +
  "focus:border-primary/50 " +
  "focus:ring-4 focus:ring-primary/10";


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
    <label className="block">

      <div
        className="
          mb-2
          flex
          items-center
          justify-between
          gap-3
        "
      >

        <span
          className="
            text-[13px]
            font-medium
            text-foreground
          "
        >
          {label}
        </span>

        {hint}

      </div>

      {children}

    </label>
  );
}


/* ============================================================
   SIGNUP PAGE
============================================================ */

function SignupPage() {

  const navigate = useNavigate();


  /* ----------------------------------------------------------
     BASIC DETAILS
  ---------------------------------------------------------- */

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");


  /* ----------------------------------------------------------
     EMAIL
  ---------------------------------------------------------- */

  const [email, setEmail] =
    useState("");


  /* ----------------------------------------------------------
     PHONE
  ---------------------------------------------------------- */

  const [phone, setPhone] =
    useState("");

  const [countryCode, setCountryCode] =
    useState("+91");


  /* ----------------------------------------------------------
     ROLE
  ---------------------------------------------------------- */

  const [role, setRole] =
    useState("");

  const [otherRole, setOtherRole] =
    useState("");

  const [experience, setExperience] =
    useState("");


  /* ----------------------------------------------------------
     PASSWORD
  ---------------------------------------------------------- */

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  /* ----------------------------------------------------------
     SUBMIT STATE
  ---------------------------------------------------------- */

  const [pending, setPending] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const googleButtonRef =
    useRef<HTMLDivElement>(null);


  /* ==========================================================
     GOOGLE SIGN-IN
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


      const result =
        await axios.post(
          "http://127.0.0.1:8000/google-login",
          {
            credential:
              response.credential,
          }
        );


      const user =
        result.data?.user;


      if (!user) {

        throw new Error(
          "Google authentication succeeded, but no user was returned."
        );

      }


      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );


      if (
        user.id !== undefined &&
        user.id !== null
      ) {

        localStorage.setItem(
          "user_id",
          String(user.id)
        );

      }


      if (result.data?.token) {

        localStorage.setItem(
          "token",
          String(
            result.data.token
          )
        );

      } else if (
        result.data?.access_token
      ) {

        localStorage.setItem(
          "token",
          String(
            result.data.access_token
          )
        );

      }


      toast.success(
        result.data?.message ||
          "Google login successful."
      );


      navigate({
        to: "/dashboard",
      });

    } catch (error: any) {

      console.error(
        "Google authentication error:",
        error
      );


      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message;


      toast.error(
        detail ||
          "Unable to sign in with Google. Please try again."
      );

    } finally {

      setGoogleLoading(false);

    }

  }


  /* ==========================================================
     INITIALIZE GOOGLE IDENTITY SERVICES
  ========================================================== */

  useEffect(() => {

    if (!GOOGLE_CLIENT_ID) {

      console.error(
        "VITE_GOOGLE_CLIENT_ID is missing from the frontend environment."
      );

      return;
    }


    const scriptId =
      "google-identity-services";


    const initializeGoogle = () => {

      const container =
        googleButtonRef.current;


      if (
        !window.google ||
        !container
      ) {

        return;
      }


      window.google.accounts.id.initialize({
        client_id:
          GOOGLE_CLIENT_ID,

        callback:
          handleGoogleSuccess,
      });


      container.innerHTML = "";


      window.google.accounts.id.renderButton(
        container,
        {
          theme: "outline",
          size: "large",
          width: 400,
          text: "continue_with",
          shape: "rectangular",
        }
      );

    };


    const existingScript =
      document.getElementById(
        scriptId
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
          }
        );

      }


      return () => {

        googleButtonRef.current?.replaceChildren();

      };

    }


    const script =
      document.createElement(
        "script"
      );


    script.id =
      scriptId;

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async =
      true;

    script.defer =
      true;


    script.addEventListener(
      "load",
      initializeGoogle,
      {
        once: true,
      }
    );


    document.head.appendChild(
      script
    );


    return () => {

      googleButtonRef.current?.replaceChildren();

    };

  }, []);


  /* ==========================================================
     PASSWORD STRENGTH
  ========================================================== */

  const passedRules =
    useMemo(() => {

      return passwordRules.filter(
        (rule) =>
          rule.test(password)
      ).length;

    }, [password]);


  const strength =
    (passedRules /
      passwordRules.length) *
    100;


  const strengthLabel =
    [
      "Too weak",
      "Weak",
      "Fair",
      "Good",
      "Strong",
    ][passedRules];


  const passwordMismatch =
    confirmPassword.length > 0 &&
    confirmPassword !== password;


  /* ==========================================================
     SUBMIT
  ========================================================== */

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (pending) {

      return;

    }


    /* --------------------------------------------------------
       NAME
    -------------------------------------------------------- */

    if (!firstName.trim()) {

      toast.error(
        "Please enter your first name."
      );

      return;
    }


    if (!lastName.trim()) {

      toast.error(
        "Please enter your last name."
      );

      return;
    }


    /* --------------------------------------------------------
       EMAIL
    -------------------------------------------------------- */

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (
      !/^[a-z0-9._%+-]+@gmail\.com$/.test(
        normalizedEmail
      )
    ) {

      toast.error(
        "Please enter a valid Gmail address."
      );

      return;
    }


    /* --------------------------------------------------------
       PHONE
    -------------------------------------------------------- */

    if (
      !/^\d{10}$/.test(
        phone
      )
    ) {

      toast.error(
        "Phone number must contain exactly 10 digits."
      );

      return;
    }


    /* --------------------------------------------------------
       ROLE
    -------------------------------------------------------- */

    if (!role) {

      toast.error(
        "Please select your role."
      );

      return;
    }


    if (
      role === "other" &&
      !otherRole.trim()
    ) {

      toast.error(
        "Please enter your role type."
      );

      return;
    }


    /* --------------------------------------------------------
       EXPERIENCE
    -------------------------------------------------------- */

    if (
      role === "experienced" &&
      !experience.trim()
    ) {

      toast.error(
        "Please enter your years of experience."
      );

      return;
    }


    /* --------------------------------------------------------
       PASSWORD
    -------------------------------------------------------- */

    if (
      passedRules <
      passwordRules.length
    ) {

      toast.error(
        "Password too weak."
      );

      return;
    }


    if (
      confirmPassword !==
      password
    ) {

      toast.error(
        "Passwords do not match."
      );

      return;
    }


    /* --------------------------------------------------------
       API
    -------------------------------------------------------- */

    try {

      setPending(true);


      await axios.post(
        "http://127.0.0.1:8000/signup",
        {
          first_name:
            firstName.trim(),

          last_name:
            lastName.trim(),

          email:
            normalizedEmail,

          phone,

          country_code:
            countryCode,

          password,

          role,

          other_role:
            role === "other"
              ? otherRole.trim()
              : "",

          experience:
            role === "experienced"
              ? experience.trim()
              : "0",
        }
      );


      toast.success(
        "Account created successfully."
      );


      navigate({
        to: "/login",
      });

    } catch (error: any) {

      console.error(
        "Signup error:",
        error
      );


      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message;


      toast.error(
        detail ||
          "Unable to create your account. Please try again."
      );

    } finally {

      setPending(false);

    }

  }


  /* ==========================================================
     PAGE
  ========================================================== */

  return (

    <div
      className="
        min-h-screen
        bg-background
        text-foreground
      "
    >

      {/* ======================================================
          CENTERED PAGE CONTAINER
      ====================================================== */}

      <div
        className="
          mx-auto
          min-h-screen
          w-full
          max-w-[1360px]
          px-6
          py-7
          lg:px-0
        "
      >

        {/* ====================================================
            TOP LOGO
        ==================================================== */}

        <div
          className="
            mb-8
            lg:mb-0
          "
        >

          <Link
            to="/"
            className="inline-flex"
          >

            <Logo />

          </Link>

        </div>


        {/* ====================================================
            MAIN TWO COLUMN LAYOUT
        ==================================================== */}

        <div
          className="
            grid
            items-start
            lg:grid-cols-[500px_665px]
            lg:gap-[95px]
          "
        >

          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <section
            className="
              flex
              min-w-0
              flex-col
              justify-center
              pt-20
              lg:pt-[155px]
            "
          >

            {/* ------------------------------------------------
                HEADING
            ------------------------------------------------ */}

            <div
              className="
                max-w-[500px]
              "
            >

              <h1
                className="
                  text-[42px]
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.035em]
                  text-foreground
                  sm:text-[44px]
                "
              >

                Build a stronger resume

                <br />

                from{" "}

                <span
                  className="text-primary"
                >
                  day one.
                </span>

              </h1>


              <p
                className="
                  mt-5
                  max-w-[470px]
                  text-[16px]
                  leading-7
                  text-muted-foreground
                "
              >
                Create your ResumeLens account
                and get practical feedback on your
                resume, skills and ATS readiness.
              </p>

            </div>


            {/* ------------------------------------------------
                BENEFITS TITLE
            ------------------------------------------------ */}

            <p
              className="
                mt-9
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-primary
              "
            >
              Why ResumeLens
            </p>


            {/* ------------------------------------------------
                BENEFITS
            ------------------------------------------------ */}

            <div
              className="
                mt-4
                max-w-[445px]
                space-y-4
              "
            >

              {benefits.map(
                (benefit) => {

                  const Icon =
                    benefit.icon;


                  return (

                    <div
                      key={
                        benefit.title
                      }
                      className="
                        flex
                        gap-4
                        rounded-2xl
                        border
                        border-border
                        bg-card
                        p-5
                        shadow-soft
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:shadow-lift
                      "
                    >

                      <div
                        className="
                          grid
                          size-11
                          shrink-0
                          place-items-center
                          rounded-full
                          bg-primary/10
                          text-primary
                        "
                      >

                        <Icon
                          className="size-5"
                          strokeWidth={1.8}
                        />

                      </div>


                      <div
                        className="
                          min-w-0
                        "
                      >

                        <p
                          className="
                            text-[15px]
                            font-semibold
                            text-foreground
                          "
                        >
                          {
                            benefit.title
                          }
                        </p>


                        <p
                          className="
                            mt-1.5
                            text-[13px]
                            leading-5
                            text-muted-foreground
                          "
                        >
                          {
                            benefit.body
                          }
                        </p>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          </section>


          {/* ==================================================
              RIGHT SIDE — SIGNUP CARD
          ================================================== */}

          <section
            className="
              mt-2
              min-w-0
              lg:mt-[-2px]
            "
          >

            <div
              className="
                rounded-[24px]
                border
                border-border
                bg-card
                p-7
                shadow-lift
                sm:p-8
              "
            >

              {/* ----------------------------------------------
                  CARD HEADER
              ---------------------------------------------- */}

              <div>

                <h2
                  className="
                    text-[25px]
                    font-semibold
                    tracking-[-0.025em]
                    text-foreground
                  "
                >
                  Create your account
                </h2>


                <p
                  className="
                    mt-2
                    text-[15px]
                    text-muted-foreground
                  "
                >
                  Start improving your resume
                  with ResumeLens.
                </p>

              </div>


              {/* ----------------------------------------------
                  FORM
              ---------------------------------------------- */}

              <form
                onSubmit={submit}
                className="
                  mt-7
                  space-y-4
                "
              >

                {/* =================================================
                    FIRST + LAST NAME
                ================================================= */}

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                  "
                >

                  <Field
                    label="First name"
                  >

                    <input
                      required
                      value={firstName}
                      onChange={(event) =>
                        setFirstName(
                          event.target.value
                        )
                      }
                      placeholder=""
                      autoComplete="given-name"
                      className={
                        inputClass
                      }
                    />

                  </Field>


                  <Field
                    label="Last name"
                  >

                    <input
                      required
                      value={lastName}
                      onChange={(event) =>
                        setLastName(
                          event.target.value
                        )
                      }
                      placeholder=""
                      autoComplete="family-name"
                      className={
                        inputClass
                      }
                    />

                  </Field>

                </div>


                {/* =================================================
                    EMAIL
                ================================================= */}

                <Field
                  label="Email"
                  hint={
                    <span
                      className="
                        text-[12px]
                        text-muted-foreground
                      "
                    >
                      Use your Gmail address.
                    </span>
                  }
                >

                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                          .toLowerCase()
                      )
                    }
                    placeholder="you@gmail.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    pattern="^[a-z0-9._%+-]+@gmail\.com$"
                    className={
                      inputClass
                    }
                  />

                </Field>


                {/* =================================================
                    PHONE
                ================================================= */}

                <Field
                  label="Phone"
                >

                  <PhoneInput
                    countryCode={
                      countryCode
                    }
                    phone={phone}
                    onCountryCodeChange={
                      setCountryCode
                    }
                    onPhoneChange={
                      setPhone
                    }
                  />

                </Field>


                {/* =================================================
                    ROLE
                ================================================= */}

                <Field
                  label="Role"
                  hint={
                    <span
                      className="
                        text-[12px]
                        text-muted-foreground
                      "
                    >
                      Tell us where you are in your career.
                    </span>
                  }
                >

                  <select
                    required
                    value={role}
                    onChange={(event) =>
                      setRole(
                        event.target.value
                      )
                    }
                    className={
                      inputClass +
                      " cursor-pointer appearance-none"
                    }
                  >

                    <option
                      value=""
                      disabled
                    >
                      Select your role
                    </option>

                    <option value="student">
                      Student
                    </option>

                    <option value="fresher">
                      Fresher
                    </option>

                    <option value="experienced">
                      Experienced
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </Field>


                {/* =================================================
                    OTHER ROLE
                ================================================= */}

                {role === "other" && (

                  <Field
                    label="Your role"
                  >

                    <input
                      required
                      value={otherRole}
                      onChange={(event) =>
                        setOtherRole(
                          event.target.value
                        )
                      }
                      placeholder="Enter your role"
                      className={
                        inputClass
                      }
                    />

                  </Field>

                )}


                {/* =================================================
                    EXPERIENCE
                ================================================= */}

                {role === "experienced" && (

                  <Field
                    label="Years of experience"
                    hint={
                      <span
                        className="
                          text-[12px]
                          text-muted-foreground
                        "
                      >
                        Your professional experience.
                      </span>
                    }
                  >

                    <input
                      required
                      type="number"
                      min="0"
                      max="45"
                      value={experience}
                      onChange={(event) =>
                        setExperience(
                          event.target.value
                        )
                      }
                      placeholder="e.g. 2"
                      className={
                        inputClass
                      }
                    />

                  </Field>

                )}


                {/* =================================================
                    PASSWORD
                ================================================= */}

                <Field
                  label="Password"
                  hint={
                    <span
                      className="
                        text-[12px]
                        text-muted-foreground
                      "
                    >
                      At least 8 characters.
                    </span>
                  }
                >

                  <div
                    className="
                      relative
                    "
                  >

                    <input
                      required
                      minLength={8}
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className={
                        inputClass +
                        " pr-11"
                      }
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) =>
                            !value
                        )
                      }
                      aria-label={
                        showPassword
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

                      {showPassword ? (

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


                {/* =================================================
                    PASSWORD STRENGTH
                ================================================= */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-border
                    bg-background/40
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <div
                      className="
                        h-1.5
                        flex-1
                        overflow-hidden
                        rounded-full
                        bg-muted
                      "
                    >

                      <div
                        className={`
                          h-full
                          rounded-full
                          transition-all
                          duration-300
                          ${
                            passedRules <= 1
                              ? "bg-destructive"
                              : passedRules <= 3
                                ? "bg-warning"
                                : "bg-success"
                          }
                        `}
                        style={{
                          width:
                            `${strength}%`,
                        }}
                      />

                    </div>


                    <span
                      className="
                        w-16
                        text-right
                        text-[11.5px]
                        text-muted-foreground
                      "
                    >
                      {
                        strengthLabel
                      }
                    </span>

                  </div>


                  <ul
                    className="
                      mt-3
                      grid
                      grid-cols-2
                      gap-x-5
                      gap-y-2
                    "
                  >

                    {passwordRules.map(
                      (rule) => {

                        const valid =
                          rule.test(
                            password
                          );


                        return (

                          <li
                            key={
                              rule.label
                            }
                            className={`
                              flex
                              items-center
                              gap-1.5
                              text-[11.5px]
                              ${
                                valid
                                  ? "text-success"
                                  : "text-muted-foreground"
                              }
                            `}
                          >

                            {valid ? (

                              <Check
                                className="size-3"
                              />

                            ) : (

                              <X
                                className="
                                  size-3
                                  opacity-60
                                "
                              />

                            )}

                            {
                              rule.label
                            }

                          </li>

                        );

                      }
                    )}

                  </ul>

                </div>


                {/* =================================================
                    CONFIRM PASSWORD
                ================================================= */}

                <Field
                  label="Confirm password"
                  hint={
                    <span
                      className="
                        text-[12px]
                        text-muted-foreground
                      "
                    >
                      Enter the same password again.
                    </span>
                  }
                >

                  <div
                    className="
                      relative
                    "
                  >

                    <input
                      required
                      minLength={8}
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className={
                        inputClass +
                        " pr-11 " +
                        (
                          passwordMismatch
                            ? "border-destructive"
                            : ""
                        )
                      }
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) =>
                            !value
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
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

                      {showConfirmPassword ? (

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


                {passwordMismatch && (

                  <p
                    className="
                      -mt-2
                      text-[11.5px]
                      text-destructive
                    "
                  >
                    Passwords must match.
                  </p>

                )}


                {/* =================================================
                    CREATE ACCOUNT
                ================================================= */}

                <button
                  type="submit"
                  disabled={pending}
                  className="
                    group
                    mt-2
                    inline-flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-primary
                    px-5
                    text-[14px]
                    font-semibold
                    text-primary-foreground
                    shadow-soft
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:shadow-lift
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {pending
                    ? "Creating account…"
                    : "Create account"
                  }


                  {!pending && (

                    <ArrowRight
                      className="
                        size-4
                        transition-transform
                        group-hover:translate-x-0.5
                      "
                    />

                  )}

                </button>


                {/* =================================================
                    DIVIDER
                ================================================= */}

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    py-1
                  "
                >

                  <span
                    className="
                      h-px
                      flex-1
                      bg-border
                    "
                  />


                  <span
                    className="
                      text-[11px]
                      uppercase
                      tracking-wider
                      text-muted-foreground
                    "
                  >
                    OR
                  </span>


                  <span
                    className="
                      h-px
                      flex-1
                      bg-border
                    "
                  />

                </div>


                {/* =================================================
                    GOOGLE
                ================================================= */}

                <div
                  className="
                    flex
                    min-h-11
                    w-full
                    items-center
                    justify-center
                  "
                  aria-busy={
                    googleLoading
                  }
                >

                  <div
                    ref={
                      googleButtonRef
                    }
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

              </form>


              {/* ----------------------------------------------
                  LOGIN LINK
              ---------------------------------------------- */}

              <p
                className="
                  mt-6
                  text-center
                  text-[12.5px]
                  text-muted-foreground
                "
              >

                Already have an account?{" "}


                <Link
                  to="/login"
                  className="
                    font-medium
                    text-primary
                    hover:underline
                  "
                >
                  Sign in
                </Link>

              </p>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}