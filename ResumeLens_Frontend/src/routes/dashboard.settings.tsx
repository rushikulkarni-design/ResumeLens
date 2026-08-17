import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Moon,
  Sun,
  Trash2,
  Mail,
  Bell,
  Database,
  Palette,
  LockKeyhole,
  LogOut,
  ShieldAlert,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      {
        title: "Settings — ResumeLens",
      },
      {
        name: "description",
        content:
          "Manage your ResumeLens account, notifications, security and privacy settings.",
      },
      {
        property: "og:title",
        content: "Settings — ResumeLens",
      },
      {
        property: "og:description",
        content:
          "Manage your ResumeLens account and workspace preferences.",
      },
    ],
  }),

  component: SettingsPage,
});


// ============================================================
// SETTINGS ROW
// ============================================================

function Row({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-5 px-5 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-[13.5px] font-medium">
            {title}
          </h3>

          <p className="mt-1 max-w-xl text-[12px] leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="sm:justify-self-end">
        {children}
      </div>
    </div>
  );
}


// ============================================================
// TOGGLE
// ============================================================

function Toggle({
  on,
  disabled = false,
  onChange,
}: {
  on: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onChange}
      className={[
        "relative flex h-7 w-12 shrink-0 items-center rounded-full border",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary/30",
        on
          ? "border-primary bg-primary"
          : "border-border bg-muted/70",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer",
      ].join(" ")}
    >
      <motion.span
        initial={false}
        animate={{
          x: on ? 20 : 3,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className="absolute top-1 size-5 rounded-full bg-white shadow-md ring-1 ring-black/10"
      />
    </button>
  );
}


// ============================================================
// SETTINGS PAGE
// ============================================================

function SettingsPage() {
  const navigate = useNavigate();

  const { theme, toggle } = useTheme();

  // ----------------------------------------------------------
  // SETTINGS
  // ----------------------------------------------------------

  const [emails, setEmails] = useState(true);
  const [product, setProduct] = useState(false);
  const [retain, setRetain] = useState(true);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);


  // ----------------------------------------------------------
  // PASSWORD
  // ----------------------------------------------------------

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [passwordOpen, setPasswordOpen] =
    useState(false);


  // ----------------------------------------------------------
  // DELETE / LOGOUT
  // ----------------------------------------------------------

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [logoutOpen, setLogoutOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);


  // ==========================================================
  // LOAD SETTINGS
  // ==========================================================

  useEffect(() => {
    async function loadSettings() {
      try {
        const userId = localStorage.getItem("user_id");

        if (!userId) {
          toast.error("Please login again.");
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:8000/settings/${userId}`
        );

        setEmails(
          response.data.email_notifications
        );

        setProduct(
          response.data.product_updates
        );

        setRetain(
          response.data.retain_files
        );
      } catch (error) {
        console.error(
          "Settings load error:",
          error
        );

        toast.error(
          "Unable to load settings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);


  // ==========================================================
  // UPDATE SETTINGS
  // ==========================================================

  async function updateSettings(
    nextEmails: boolean,
    nextProduct: boolean,
    nextRetain: boolean
  ) {
    try {
      setUpdating(true);

      const userId =
        localStorage.getItem("user_id");

      if (!userId) {
        toast.error("Please login again.");
        return false;
      }

      await axios.put(
        `http://127.0.0.1:8000/settings/${userId}`,
        {
          email_notifications: nextEmails,
          product_updates: nextProduct,
          retain_files: nextRetain,
        }
      );

      return true;
    } catch (error) {
      console.error(
        "Settings update error:",
        error
      );

      toast.error(
        "Unable to update setting."
      );

      return false;
    } finally {
      setUpdating(false);
    }
  }


  // ==========================================================
  // EMAIL TOGGLE
  // ==========================================================

  async function toggleEmails() {
    const next = !emails;

    setEmails(next);

    const success = await updateSettings(
      next,
      product,
      retain
    );

    if (!success) {
      setEmails(!next);
    } else {
      toast.success(
        next
          ? "Analysis emails enabled."
          : "Analysis emails disabled."
      );
    }
  }


  // ==========================================================
  // PRODUCT TOGGLE
  // ==========================================================

  async function toggleProduct() {
    const next = !product;

    setProduct(next);

    const success = await updateSettings(
      emails,
      next,
      retain
    );

    if (!success) {
      setProduct(!next);
    } else {
      toast.success(
        next
          ? "Product updates enabled."
          : "Product updates disabled."
      );
    }
  }


  // ==========================================================
  // RETAIN FILES
  // ==========================================================

  async function toggleRetain() {
    const next = !retain;

    setRetain(next);

    const success = await updateSettings(
      emails,
      product,
      next
    );

    if (!success) {
      setRetain(!next);
    } else {
      toast.success(
        next
          ? "Resume history storage enabled."
          : "Resume history storage disabled."
      );
    }
  }


  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  async function changePassword(
    e: FormEvent
  ) {
    e.preventDefault();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      toast.error(
        "Please fill in all password fields."
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      toast.error(
        "New passwords do not match."
      );

      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        "New password must be at least 8 characters."
      );

      return;
    }

    try {
      setChangingPassword(true);

      const userId =
        localStorage.getItem("user_id");

      if (!userId) {
        toast.error(
          "Please login again."
        );

        return;
      }

      await axios.put(
        `http://127.0.0.1:8000/change-password/${userId}`,
        {
          current_password:
            currentPassword,

          new_password:
            newPassword,
        }
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordOpen(false);

      toast.success(
        "Password changed successfully."
      );
    } catch (error: any) {
      console.error(
        "Password change error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
          "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  }


  // ==========================================================
  // LOGOUT
  // ==========================================================

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("token");

    setLogoutOpen(false);

    toast.success(
      "You have been logged out."
    );

    navigate({
      to: "/login",
    });
  }


  // ==========================================================
  // DELETE ACCOUNT
  // ==========================================================

  async function deleteAccount() {
    try {
      setDeleting(true);

      const userId =
        localStorage.getItem("user_id");

      if (!userId) {
        toast.error(
          "Please login again."
        );

        return;
      }

      await axios.delete(
        `http://127.0.0.1:8000/account/${userId}`
      );

      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      localStorage.removeItem("token");

      setDeleteOpen(false);

      toast.success(
        "Account deleted successfully."
      );

      navigate({
        to: "/login",
      });
    } catch (error: any) {
      console.error(
        "Account deletion error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
          "Unable to delete account."
      );
    } finally {
      setDeleting(false);
    }
  }


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <div className="rounded-2xl border border-border bg-surface p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <motion.header
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
        }}
      >
        <div className="flex items-center gap-3">

          <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Palette className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">
              Settings
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account, notifications,
              security and privacy.
            </p>
          </div>

        </div>
      </motion.header>


      {/* ====================================================
          APPEARANCE & NOTIFICATIONS
      ==================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.55,
          delay: 0.08,
        }}
        className="hairline mt-8 divide-y divide-border overflow-hidden rounded-2xl bg-surface shadow-soft"
      >

        {/* APPEARANCE */}

        <Row
          title="Appearance"
          description="Choose how ResumeLens looks across your workspace."
          icon={
            theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )
          }
        >
          <button
            type="button"
            onClick={toggle}
            className="inline-flex h-10 min-w-[105px] items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 text-[12.5px] font-medium transition-colors hover:bg-accent"
          >
            {theme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}

            {theme === "dark"
              ? "Dark"
              : "Light"}
          </button>
        </Row>


        {/* ANALYSIS EMAILS */}

        <Row
          title="Analysis emails"
          description="Receive an email when your resume analysis is completed."
          icon={
            <Mail className="h-4 w-4" />
          }
        >
          <Toggle
            on={emails}
            disabled={updating}
            onChange={toggleEmails}
          />
        </Row>


        {/* PRODUCT UPDATES */}

        <Row
          title="Product updates"
          description="Receive occasional updates about new ResumeLens features and improvements."
          icon={
            <Bell className="h-4 w-4" />
          }
        >
          <Toggle
            on={product}
            disabled={updating}
            onChange={toggleProduct}
          />
        </Row>


        {/* KEEP FILES */}

        <Row
          title="Keep uploaded files"
          description="Store analyzed resumes so they remain available in your history."
          icon={
            <Database className="h-4 w-4" />
          }
        >
          <Toggle
            on={retain}
            disabled={updating}
            onChange={toggleRetain}
          />
        </Row>

      </motion.section>


      {/* ====================================================
          SECURITY
      ==================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.55,
          delay: 0.14,
        }}
        className="hairline mt-6 overflow-hidden rounded-2xl bg-surface shadow-soft"
      >

        <div className="border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">

            <LockKeyhole className="h-4 w-4 text-primary" />

            <h2 className="text-[13.5px] font-semibold">
              Security
            </h2>

          </div>
        </div>


        {/* CHANGE PASSWORD */}

        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <div>
            <h3 className="text-[13.5px] font-medium">
              Change password
            </h3>

            <p className="mt-1 text-[12px] text-muted-foreground">
              Update your account password.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setPasswordOpen(
                (value) => !value
              )
            }
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-border px-4 text-[12.5px] font-medium transition-colors hover:bg-accent"
          >
            <LockKeyhole className="h-4 w-4" />

            {passwordOpen
              ? "Close"
              : "Change password"}
          </button>

        </div>


        {/* PASSWORD FORM */}

        {passwordOpen && (
          <motion.form
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            onSubmit={changePassword}
            className="border-t border-border bg-background/30 px-5 py-5 sm:px-6"
          >

            <div className="grid gap-4 sm:grid-cols-3">

              {/* CURRENT PASSWORD */}

              <div>
                <label className="text-[12px] font-medium">
                  Current password
                </label>

                <div className="relative mt-2">

                  <input
                    required
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 pr-10 text-sm outline-none focus:border-primary"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>
              </div>


              {/* NEW PASSWORD */}

              <div>
                <label className="text-[12px] font-medium">
                  New password
                </label>

                <div className="relative mt-2">

                  <input
                    required
                    minLength={8}
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 pr-10 text-sm outline-none focus:border-primary"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>
              </div>


              {/* CONFIRM PASSWORD */}

              <div>
                <label className="text-[12px] font-medium">
                  Confirm password
                </label>

                <div className="relative mt-2">

                  <input
                    required
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 pr-10 text-sm outline-none focus:border-primary"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>
              </div>

            </div>


            <div className="mt-4 flex justify-end">

              <button
                type="submit"
                disabled={changingPassword}
                className="bg-brand inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[12.5px] font-medium text-primary-foreground shadow-soft disabled:opacity-60"
              >
                <LockKeyhole className="h-4 w-4" />

                {changingPassword
                  ? "Updating..."
                  : "Update password"}
              </button>

            </div>

          </motion.form>
        )}

      </motion.section>


      {/* ====================================================
          ACCOUNT
      ==================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.55,
          delay: 0.2,
        }}
        className="hairline mt-6 overflow-hidden rounded-2xl bg-surface shadow-soft"
      >

        <div className="border-b border-border px-5 py-4 sm:px-6">

          <div className="flex items-center gap-2">

            <LogOut className="h-4 w-4 text-primary" />

            <h2 className="text-[13.5px] font-semibold">
              Account
            </h2>

          </div>

        </div>


        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <div>

            <h3 className="text-[13.5px] font-medium">
              Logout
            </h3>

            <p className="mt-1 text-[12px] text-muted-foreground">
              Logout of this ResumeLens account on this device.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              setLogoutOpen(true)
            }
            className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-4 text-[12.5px] font-medium transition-colors hover:bg-accent"
          >

            <LogOut className="h-4 w-4" />

            Logout

          </button>

        </div>

      </motion.section>


      {/* ====================================================
          DANGER ZONE
      ==================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.55,
          delay: 0.26,
        }}
        className="mt-6 overflow-hidden rounded-2xl border border-destructive/25 bg-destructive/[0.035]"
      >

        <div className="border-b border-destructive/15 px-5 py-4 sm:px-6">

          <div className="flex items-center gap-2">

            <ShieldAlert className="h-4 w-4 text-destructive" />

            <h2 className="text-[13.5px] font-semibold">
              Danger zone
            </h2>

          </div>

        </div>


        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

          <div>

            <h3 className="text-[13.5px] font-medium">
              Delete account
            </h3>

            <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
              Permanently delete your ResumeLens
              account, profile and analysis history.
              This action cannot be undone.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              setDeleteOpen(true)
            }
            className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-destructive/35 px-4 text-[12.5px] font-medium text-destructive transition-colors hover:bg-destructive/10"
          >

            <Trash2 className="h-4 w-4" />

            Delete account

          </button>

        </div>

      </motion.section>


      {/* ====================================================
          DELETE ACCOUNT MODAL
      ==================================================== */}

      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setDeleteOpen(false);
            }
          }}
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lift"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-start gap-3">

                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">

                  <Trash2 className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="text-base font-semibold">
                    Delete account?
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    This action cannot be undone.
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={() =>
                  setDeleteOpen(false)
                }
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >

                <X className="h-4 w-4" />

              </button>

            </div>


            <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/[0.04] p-4">

              <p className="text-sm leading-6">
                Are you sure you want to permanently
                remove your ResumeLens account?
              </p>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Your profile and all resume analysis
                history will be permanently removed.
              </p>

            </div>


            <div className="mt-6 flex justify-end gap-2">

              <button
                type="button"
                onClick={() =>
                  setDeleteOpen(false)
                }
                disabled={deleting}
                className="h-10 rounded-xl border border-border px-4 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-60"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleting}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-destructive px-4 text-[13px] font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >

                <Trash2 className="h-4 w-4" />

                {deleting
                  ? "Deleting..."
                  : "Delete account"}

              </button>

            </div>

          </motion.div>

        </div>
      )}


      {/* ====================================================
          LOGOUT CONFIRMATION MODAL
      ==================================================== */}

      {logoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setLogoutOpen(false);
            }
          }}
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lift"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-start gap-3">

                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">

                  <LogOut className="h-5 w-5" />

                </div>

                <div>

                  <h2 className="text-base font-semibold">
                    Logout?
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Logout of your ResumeLens account?
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={() =>
                  setLogoutOpen(false)
                }
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >

                <X className="h-4 w-4" />

              </button>

            </div>


            <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">

              <p className="text-sm leading-6 text-muted-foreground">
                Are you sure you want to logout from this device?
              </p>

            </div>


            <div className="mt-6 flex justify-end gap-2">

              <button
                type="button"
                onClick={() =>
                  setLogoutOpen(false)
                }
                className="h-10 rounded-xl border border-border px-4 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >

                <LogOut className="h-4 w-4" />

                Logout

              </button>

            </div>

          </motion.div>

        </div>
      )}

    </div>
  );
}