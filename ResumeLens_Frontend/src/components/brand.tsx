import { cn } from "@/lib/utils";

/* ============================================================
   RESUMELENS LOGO MARK
============================================================ */

export function LogoMark({
  className,
}: {
  className?: string;
}) {
  return (
    <img
      src="/branding/resumelens-logo.jpg"
      alt="ResumeLens logo"
      draggable={false}
      className={cn(
        "block h-10 w-10 shrink-0 object-contain",
        className,
      )}
    />
  );
}

/* ============================================================
   RESUMELENS BRAND
============================================================ */

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-4",
        className,
      )}
    >
      {/* Actual ResumeLens logo */}
      <LogoMark
        className={
          compact
            ? "h-9 w-9"
            : "h-10 w-10"
        }
      />

      {/* Brand name beside logo */}
      {!compact && (
        <span className="whitespace-nowrap text-[28px] font-bold tracking-[-0.04em]">
          <span className="text-foreground">
            Resume
          </span>
          <span className="text-primary">
            Lens
          </span>
        </span>
      )}
    </span>
  );
}