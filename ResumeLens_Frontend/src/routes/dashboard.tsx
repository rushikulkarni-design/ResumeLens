import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import {
  LogOut,
  Moon,
  Sun,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { LogoMark } from "@/components/brand";
import { useTheme } from "@/components/theme-provider";
import FloatingSidebar from "@/components/floating-sidebar/floating-sidebar";


// ============================================================
// ROUTE
// ============================================================

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});


// ============================================================
// PAGE TITLES
// ============================================================

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/history": "History",
  "/dashboard/profile": "Profile",
  "/dashboard/settings": "Settings",
};


// ============================================================
// USER INITIALS
// ============================================================

function getUserInitials(user: unknown): string {
  if (!user || typeof user !== "object") {
    return "U";
  }

  const data = user as {
    first_name?: unknown;
    last_name?: unknown;
  };

  const firstName =
    typeof data.first_name === "string"
      ? data.first_name.trim()
      : "";

  const lastName =
    typeof data.last_name === "string"
      ? data.last_name.trim()
      : "";

  const firstInitial =
    firstName.charAt(0);

  const lastInitial =
    lastName.charAt(0);

  const initials =
    `${firstInitial}${lastInitial}`.toUpperCase();

  if (initials) {
    return initials;
  }

  if (firstInitial) {
    return firstInitial.toUpperCase();
  }

  if (lastInitial) {
    return lastInitial.toUpperCase();
  }

  return "U";
}


// ============================================================
// DASHBOARD LAYOUT
// ============================================================

function DashboardLayout() {

  const navigate = useNavigate();

  const pathname = useRouterState({
    select: (state) =>
      state.location.pathname,
  });

  const { theme, toggle } =
    useTheme();


  // ==========================================================
  // STATE
  // ==========================================================

  const [userInitials, setUserInitials] =
    useState("U");

  const [logoutOpen, setLogoutOpen] =
    useState(false);


  // ==========================================================
  // LOAD USER
  // ==========================================================

  useEffect(() => {

    const loadUserInitials = () => {

      try {

        const storedUser =
          localStorage.getItem("user");

        if (!storedUser) {

          setUserInitials("U");

          return;
        }

        const user =
          JSON.parse(storedUser);

        setUserInitials(
          getUserInitials(user)
        );

      } catch (error) {

        console.error(
          "Unable to load user initials:",
          error
        );

        setUserInitials("U");

      }

    };


    loadUserInitials();


    const handleStorageChange = () => {
      loadUserInitials();
    };


    window.addEventListener(
      "storage",
      handleStorageChange
    );


    return () => {

      window.removeEventListener(
        "storage",
        handleStorageChange
      );

    };

  }, []);


  // ==========================================================
  // LOGOUT
  // ==========================================================

  function logout() {

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "user_id"
    );

    localStorage.removeItem(
      "token"
    );

    setLogoutOpen(false);

    toast.success(
      "You have been logged out."
    );

    navigate({
      to: "/login",
    });

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div
      className="
        min-h-screen
        w-full
        bg-background
      "
    >

      {/* =====================================================
          FLOATING SIDEBAR

          This replaces the old full-height sidebar.
          The hamburger button is provided by this component.
      ===================================================== */}

      <FloatingSidebar
        onLogout={() => {
          setLogoutOpen(true);
        }}
      />


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className="
          flex
          min-h-screen
          min-w-0
          flex-col
        "
      >


        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className="
            sticky
            top-0
            z-30
            border-b
            border-border
            bg-background/80
            backdrop-blur-xl
          "
        >

          <div
            className="
              grid
              h-16
              grid-cols-[minmax(0,1fr)_auto]
              items-center
              gap-4
              px-5
              sm:px-8
            "
          >


            {/* ===============================================
                LEFT SIDE
            =============================================== */}

            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >

              {/* MOBILE LOGO */}

              <Link
                to="/"
                aria-label="ResumeLens home"
                className="lg:hidden"
              >

                <LogoMark />

              </Link>


              {/* PAGE TITLE */}

              {/* PAGE TITLE */}
              <div className="flex items-center gap-4">
              {/* PAGE TITLE */}

                <div className="ml-16 min-w-0">
                  <h1
                    className="
                      truncate
                      text-[15px]
                      font-medium
                      text-foreground
                    "
                  >
                    {titles[pathname] ?? "Dashboard"}
                  </h1>
                </div>

            </div>

            </div>


            {/* ===============================================
                RIGHT SIDE
            =============================================== */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-2
              "
            >


              {/* THEME */}

              <button
                type="button"
                onClick={toggle}
                aria-label="Toggle theme"
                className="
                  ring-focus
                  grid
                  size-9
                  place-items-center
                  rounded-lg
                  text-muted-foreground
                  transition-colors
                  hover:bg-accent
                  hover:text-foreground
                "
              >

                {theme === "dark" ? (

                  <Sun className="size-4" />

                ) : (

                  <Moon className="size-4" />

                )}

              </button>


              {/* USER AVATAR */}

              <Link
                to="/dashboard/profile"
                aria-label="Open profile"
                title="Profile"
                className="
                  grid
                  size-8
                  place-items-center
                  rounded-full
                  border
                  border-border-strong
                  bg-surface-2
                  text-[11.5px]
                  font-medium
                  text-foreground
                  transition-colors
                  hover:bg-accent
                "
              >

                {userInitials}

              </Link>

            </div>

          </div>

        </header>


        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main
          className="
            min-w-0
            flex-1
          "
        >

          <Outlet />

        </main>

      </div>


      {/* =====================================================
          LOGOUT CONFIRMATION MODAL
      ===================================================== */}

      {logoutOpen && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/60
            p-5
            backdrop-blur-sm
          "
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

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
            transition={{
              duration: 0.18,
            }}
            className="
              w-full
              max-w-md
              rounded-2xl
              border
              border-border
              bg-surface
              p-6
              shadow-lift
            "
          >


            {/* ===============================================
                MODAL HEADER
            =============================================== */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                {/* ICON */}

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

                  <LogOut
                    className="h-5 w-5"
                  />

                </div>


                {/* TITLE */}

                <div>

                  <h2
                    className="
                      text-base
                      font-semibold
                    "
                  >

                    Sign out?

                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-muted-foreground
                    "
                  >

                    Sign out of your
                    ResumeLens account?

                  </p>

                </div>

              </div>


              {/* CLOSE */}

              <button
                type="button"
                onClick={() =>
                  setLogoutOpen(false)
                }
                aria-label="Close logout confirmation"
                className="
                  grid
                  size-8
                  place-items-center
                  rounded-lg
                  text-muted-foreground
                  transition-colors
                  hover:bg-accent
                  hover:text-foreground
                "
              >

                <X
                  className="h-4 w-4"
                />

              </button>

            </div>


            {/* ===============================================
                MESSAGE
            =============================================== */}

            <div
              className="
                mt-5
                rounded-xl
                border
                border-border
                bg-background/40
                p-4
              "
            >

              <p
                className="
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >

                Are you sure you want to logout
                from this device?

              </p>

            </div>


            {/* ===============================================
                ACTIONS
            =============================================== */}

            <div
              className="
                mt-6
                flex
                justify-end
                gap-2
              "
            >


              {/* CANCEL */}

              <button
                type="button"
                onClick={() =>
                  setLogoutOpen(false)
                }
                className="
                  h-10
                  rounded-xl
                  border
                  border-border
                  px-4
                  text-[13px]
                  font-medium
                  text-muted-foreground
                  transition-colors
                  hover:bg-accent
                  hover:text-foreground
                "
              >

                Cancel

              </button>


              {/* CONFIRM */}

              <button
                type="button"
                onClick={logout}
                className="
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  bg-primary
                  px-4
                  text-[13px]
                  font-medium
                  text-primary-foreground
                  transition-opacity
                  hover:opacity-90
                "
              >

                <LogOut
                  className="h-4 w-4"
                />

                Logout

              </button>

            </div>

          </motion.div>

        </div>

      )}

    </div>

  );

}