import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import axios from "axios";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/auth-shell";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";


function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
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
   ROUTE
============================================================ */

export const Route = createFileRoute(
  "/forgot-password"
)({
  component: ForgotPasswordPage,
});


/* ============================================================
   API
============================================================ */

const API_URL =
  "http://127.0.0.1:8000";


/* ============================================================
   PAGE
============================================================ */

function ForgotPasswordPage() {

  const navigate = useNavigate();


  /* ==========================================================
     EMAIL
  ========================================================== */

  const [email, setEmail] =
    useState("");


  /* ==========================================================
     OTP
  ========================================================== */

  const [otp, setOtp] =
    useState("");


  /* ==========================================================
     PASSWORD
  ========================================================== */

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  /* ==========================================================
     STEP
  ========================================================== */

  const [step, setStep] =
    useState<
      "email" |
      "otp" |
      "reset"
    >("email");


  /* ==========================================================
     LOADING
  ========================================================== */

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);


  /* ==========================================================
     SEND OTP
  ========================================================== */

  async function sendOtp(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (loading) {
      return;
    }


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    /* --------------------------------------------------------
       EMPTY EMAIL
    -------------------------------------------------------- */

    if (!normalizedEmail) {

      toast.error(
        "Please enter your email address."
      );

      return;
    }


    /* --------------------------------------------------------
       GMAIL VALIDATION
    -------------------------------------------------------- */

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


    try {

      setLoading(true);


      await axios.post(
        `${API_URL}/forgot-password`,
        {
          email:
            normalizedEmail,
        }
      );


      /* ------------------------------------------------------
         SAVE EMAIL
      ------------------------------------------------------ */

      setEmail(
        normalizedEmail
      );

      setOtp("");

      setStep("otp");


      toast.success(
        "OTP sent successfully. Check your email."
      );

    } catch (error: unknown) {

      console.error(
        "Forgot password error:",
        error
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
        "Unable to send OTP. Please try again.";


      toast.error(
        String(message)
      );

    } finally {

      setLoading(false);

    }
  }


  /* ==========================================================
     VERIFY OTP
  ========================================================== */

  async function verifyOtp(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (loading) {
      return;
    }


    const cleanOtp =
      otp.trim();


    /* --------------------------------------------------------
       OTP LENGTH
    -------------------------------------------------------- */

    if (
      cleanOtp.length !== 6
    ) {

      toast.error(
        "Please enter the 6-digit OTP."
      );

      return;
    }


    /* --------------------------------------------------------
       OTP NUMBERS ONLY
    -------------------------------------------------------- */

    if (
      !/^\d{6}$/.test(
        cleanOtp
      )
    ) {

      toast.error(
        "OTP must contain only numbers."
      );

      return;
    }


    try {

      setLoading(true);


      await axios.post(
        `${API_URL}/verify-reset-otp`,
        {
          email:
            email
              .trim()
              .toLowerCase(),

          otp:
            cleanOtp,
        }
      );


      setOtp(
        cleanOtp
      );

      setStep("reset");


      toast.success(
        "OTP verified successfully."
      );

    } catch (error: unknown) {

      console.error(
        "OTP verification error:",
        error
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
        "Invalid OTP. Please try again.";


      toast.error(
        String(message)
      );

    } finally {

      setLoading(false);

    }
  }


  /* ==========================================================
     RESET PASSWORD
  ========================================================== */

  async function resetPassword(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (loading) {
      return;
    }


    /* --------------------------------------------------------
       NEW PASSWORD
    -------------------------------------------------------- */

    if (!newPassword) {

      toast.error(
        "Please enter a new password."
      );

      return;
    }


    if (
      newPassword.length < 8
    ) {

      toast.error(
        "Password must be at least 8 characters."
      );

      return;
    }


    if (
      newPassword.length > 72
    ) {

      toast.error(
        "Password must be 72 characters or less."
      );

      return;
    }


    /* --------------------------------------------------------
       CONFIRM PASSWORD
    -------------------------------------------------------- */

    if (!confirmPassword) {

      toast.error(
        "Please confirm your password."
      );

      return;
    }


    if (
      newPassword !==
      confirmPassword
    ) {

      toast.error(
        "Passwords do not match."
      );

      return;
    }


    /* --------------------------------------------------------
       EMAIL / OTP SAFETY CHECK
    -------------------------------------------------------- */

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (!normalizedEmail) {

      toast.error(
        "Your email is missing. Please start again."
      );

      setStep("email");

      return;
    }


    if (
      !/^\d{6}$/.test(
        otp
      )
    ) {

      toast.error(
        "Your OTP is invalid. Please verify again."
      );

      setStep("otp");

      return;
    }


    try {

      setLoading(true);


      await axios.post(
        `${API_URL}/reset-password`,
        {
          email:
            normalizedEmail,

          otp:
            otp.trim(),

          new_password:
            newPassword,
        }
      );


      toast.success(
        "Password updated successfully."
      );


      /* ------------------------------------------------------
         CLEAR SENSITIVE DATA
      ------------------------------------------------------ */

      setOtp("");

      setNewPassword("");

      setConfirmPassword("");


      /* ------------------------------------------------------
         GO TO LOGIN
      ------------------------------------------------------ */

      setTimeout(() => {

        navigate({
          to: "/login",
        });

      }, 700);

    } catch (error: unknown) {

      console.error(
        "Password reset error:",
        error
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
        "Unable to reset password. Please try again.";


      toast.error(
        String(message)
      );

    } finally {

      setLoading(false);

    }
  }


  /* ==========================================================
     RESEND OTP
  ========================================================== */

  async function resendOtp() {

    if (resending) {
      return;
    }


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (!normalizedEmail) {

      toast.error(
        "Please enter your email again."
      );

      setStep("email");

      return;
    }


    try {

      setResending(true);


      await axios.post(
        `${API_URL}/forgot-password`,
        {
          email:
            normalizedEmail,
        }
      );


      setOtp("");


      toast.success(
        "A new OTP has been sent to your Gmail address."
      );

    } catch (error: unknown) {

      console.error(
        "Resend OTP error:",
        error
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
        "Unable to resend OTP.";


      toast.error(
        String(message)
      );

    } finally {

      setResending(false);

    }
  }


  /* ==========================================================
     EMAIL SCREEN
  ========================================================== */

  if (step === "email") {

    return (

      <AuthShell
        heading="Forgot your password?"
        copy="Enter the Gmail address associated with your ResumeLens account and we'll send you a verification code."
      >

        <form
          onSubmit={sendOtp}
          className="space-y-5"
        >

          <Field
            label="Email address"
            hint="Use the Gmail address you used when creating your account."
          >

            <div className="relative">

              <Mail
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-muted-foreground
                "
              />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
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


          <button
            type="submit"
            disabled={loading}
            className="
              inline-flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-primary
              px-4
              text-sm
              font-medium
              text-primary-foreground
              shadow-soft
              transition-opacity
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <Mail className="h-4 w-4" />

            {loading
              ? "Sending OTP..."
              : "Send OTP"}

          </button>


          <Link
            to="/login"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              text-xs
              text-muted-foreground
              transition-colors
              hover:text-foreground
            "
          >

            <ArrowLeft
              className="h-3.5 w-3.5"
            />

            Back to login

          </Link>

        </form>

      </AuthShell>
    );
  }


  /* ==========================================================
     OTP SCREEN
  ========================================================== */

  if (step === "otp") {

    return (

      <AuthShell
        heading="Enter your OTP"
        copy={`We sent a 6-digit verification code to ${email}.`}
      >

        <form
          onSubmit={verifyOtp}
          className="space-y-5"
        >

          <div
            className="
              rounded-2xl
              border
              border-primary/20
              bg-primary/5
              p-4
            "
          >

            <div
              className="
                flex
                items-start
                gap-3
              "
            >

              <div
                className="
                  grid
                  size-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  bg-primary/10
                  text-primary
                "
              >

                <ShieldCheck
                  className="h-5 w-5"
                />

              </div>


              <div>

                <p
                  className="
                    text-sm
                    font-medium
                  "
                >
                  Check your inbox
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  Enter the 6-digit OTP
                  from the email we sent you.
                  The code is valid for 10 minutes.
                </p>

              </div>

            </div>

          </div>


          <Field
            label="Verification code"
            hint="Enter the 6-digit code."
          >

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="000000"
              autoComplete="one-time-code"
              required
              className={`
                ${inputClass}
                text-center
                text-lg
                font-semibold
                tracking-[0.5em]
              `}
            />

          </Field>


          <button
            type="submit"
            disabled={
              loading ||
              otp.length !== 6
            }
            className="
              inline-flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-primary
              px-4
              text-sm
              font-medium
              text-primary-foreground
              shadow-soft
              transition-opacity
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <ShieldCheck
              className="h-4 w-4"
            />

            {loading
              ? "Verifying..."
              : "Verify OTP"}

          </button>


          <button
            type="button"
            onClick={resendOtp}
            disabled={resending}
            className="
              inline-flex
              h-10
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-border
              text-sm
              font-medium
              transition-colors
              hover:bg-accent
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            {resending
              ? "Sending..."
              : "Resend OTP"}

          </button>


          <button
            type="button"
            onClick={() => {

              setOtp("");

              setStep("email");

            }}
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              text-xs
              text-muted-foreground
              transition-colors
              hover:text-foreground
            "
          >

            <ArrowLeft
              className="h-3.5 w-3.5"
            />

            Use another email

          </button>


          <Link
            to="/login"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              text-xs
              text-muted-foreground
              transition-colors
              hover:text-foreground
            "
          >
            Back to login
          </Link>

        </form>

      </AuthShell>
    );
  }


  /* ==========================================================
     RESET PASSWORD SCREEN
  ========================================================== */

  return (

    <AuthShell
      heading="Set a new password"
      copy="Your OTP has been verified. Create a new password for your ResumeLens account."
    >

      <form
        onSubmit={resetPassword}
        className="space-y-5"
      >

        <div
          className="
            rounded-2xl
            border
            border-primary/20
            bg-primary/5
            p-4
          "
        >

          <div
            className="
              flex
              items-start
              gap-3
            "
          >

            <div
              className="
                grid
                size-10
                shrink-0
                place-items-center
                rounded-xl
                bg-primary/10
                text-primary
              "
            >

              <LockKeyhole
                className="h-5 w-5"
              />

            </div>


            <div>

              <p
                className="
                  text-sm
                  font-medium
                "
              >
                OTP verified
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-muted-foreground
                "
              >
                Create a new password for
                your account.
              </p>

            </div>

          </div>

        </div>


        {/* ====================================================
            NEW PASSWORD
        ==================================================== */}

        <Field
          label="New password"
          hint="Use 8–72 characters."
        >

          <div className="relative">

            <LockKeyhole
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />


            <input
              required
              minLength={8}
              maxLength={72}
              type={
                showNewPassword
                  ? "text"
                  : "password"
              }
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
              placeholder="Enter new password"
              autoComplete="new-password"
              className={`
                ${inputClass}
                pl-10
                pr-10
              `}
            />


            <button
              type="button"
              aria-label={
                showNewPassword
                  ? "Hide new password"
                  : "Show new password"
              }
              onClick={() =>
                setShowNewPassword(
                  (value) => !value
                )
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

              {showNewPassword ? (

                <EyeOff
                  className="h-4 w-4"
                />

              ) : (

                <Eye
                  className="h-4 w-4"
                />

              )}

            </button>

          </div>

        </Field>


        {/* ====================================================
            CONFIRM PASSWORD
        ==================================================== */}

        <Field
          label="Confirm new password"
          hint="Enter the same password again."
        >

          <div className="relative">

            <LockKeyhole
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />


            <input
              required
              minLength={8}
              maxLength={72}
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              className={`
                ${inputClass}
                pl-10
                pr-10
              `}
            />


            <button
              type="button"
              aria-label={
                showConfirmPassword
                  ? "Hide confirmed password"
                  : "Show confirmed password"
              }
              onClick={() =>
                setShowConfirmPassword(
                  (value) => !value
                )
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
                  className="h-4 w-4"
                />

              ) : (

                <Eye
                  className="h-4 w-4"
                />

              )}

            </button>

          </div>

        </Field>


        {/* ====================================================
            PASSWORD MISMATCH
        ==================================================== */}

        {confirmPassword.length > 0 &&
          newPassword !== confirmPassword && (

            <p
              className="
                -mt-2
                text-xs
                text-destructive
              "
            >
              Passwords do not match.
            </p>

          )}


        {/* ====================================================
            UPDATE PASSWORD
        ==================================================== */}

        <button
          type="submit"
          disabled={loading}
          className="
            inline-flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-primary
            px-4
            text-sm
            font-medium
            text-primary-foreground
            shadow-soft
            transition-opacity
            hover:opacity-90
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >

          <LockKeyhole
            className="h-4 w-4"
          />

          {loading
            ? "Updating password..."
            : "Update password"}

        </button>


        {/* ====================================================
            BACK TO OTP
        ==================================================== */}

        <button
          type="button"
          onClick={() => {

            setNewPassword("");

            setConfirmPassword("");

            setStep("otp");

          }}
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            text-xs
            text-muted-foreground
            transition-colors
            hover:text-foreground
          "
        >

          <ArrowLeft
            className="h-3.5 w-3.5"
          />

          Back to OTP

        </button>


        <Link
          to="/login"
          className="
            inline-flex
            w-full
            items-center
            justify-center
            text-xs
            text-muted-foreground
            transition-colors
            hover:text-foreground
          "
        >
          Back to login
        </Link>

      </form>

    </AuthShell>
  );
}