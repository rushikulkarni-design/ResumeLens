import * as React from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  History,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";

interface FloatingSidebarProps {
  onLogout?: () => void;
}

export default function FloatingSidebar({
  onLogout,
}: FloatingSidebarProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = useRouterState({
  select: (state) => state.location.pathname,
});

  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      label: "History",
      icon: History,
      path: "/dashboard/history",
    },
    {
      label: "Profile",
      icon: User,
      path: "/dashboard/profile",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
  ];

  return (
    <>
      {/* =====================================================
          HAMBURGER BUTTON
      ===================================================== */}

      {!open && (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="
            relative z-50
            top-13
            z-[100]
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            border-border
            bg-card
            text-foreground
            shadow-lg
            transition-all
            duration-200
            hover:scale-105
            hover:bg-accent
            focus:outline-none
            focus:ring-2
            focus:ring-primary/30
          "
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* =====================================================
          BACKDROP
      ===================================================== */}

      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-[90]
            bg-black/10
            backdrop-blur-[1px]
          "
        />
      )}

      {/* =====================================================
          FLOATING SIDEBAR
      ===================================================== */}

      <aside
        className={cn(
          `
            fixed
            left-5
            top-5
            z-[100]
            flex
            h-[calc(100vh-40px)]
            max-h-[760px]
            w-[350px]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card
            shadow-2xl
            transition-all
            duration-200
            ease-out
          `,
          open
            ? "translate-x-0 opacity-100"
            : "-translate-x-[120%] opacity-0 pointer-events-none",
        )}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            flex
            h-[82px]
            shrink-0
            items-center
            justify-between
            border-b
            border-border
            px-5
          "
        >
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center"
          >
            <Logo />
          </Link>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-foreground
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                location.pathname === item.path ||
                (
                  item.path !== "/dashboard" &&
                  location.pathname.startsWith(item.path)
                );

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    `
                      flex
                      h-11
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3.5
                      text-sm
                      font-medium
                      transition-all
                      duration-150
                    `,
                    isActive
                      ? `
                        bg-primary/10
                        text-primary
                        shadow-sm
                      `
                      : `
                        text-muted-foreground
                        hover:bg-accent
                        hover:text-foreground
                      `,
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                    strokeWidth={1.8}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-border
            p-3
          "
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className="
              flex
              h-11
              w-full
              items-center
              gap-3
              rounded-xl
              px-3.5
              text-sm
              font-medium
              text-muted-foreground
              transition-colors
              hover:bg-accent
              hover:text-foreground
            "
          >
            <LogOut
              className="h-[18px] w-[18px]"
              strokeWidth={1.8}
            />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}