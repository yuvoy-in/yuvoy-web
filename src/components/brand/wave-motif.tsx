import { cn } from "@/lib/cn";

/**
 * A small three-line wave glyph: the island signature, used sparingly as a
 * section accent. Decorative always; tone follows the surface it sits on.
 */
export function WaveMotif({
  tone = "onLight",
  className,
}: {
  tone?: "onLight" | "onDark";
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 56 22"
      fill="none"
      className={cn(
        "h-5 w-14",
        tone === "onDark" ? "text-terra-soft" : "text-terra",
        className,
      )}
    >
      <path
        d="M2 5c6-4 12-4 18 0s12 4 18 0 12-4 16 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M6 12c5-3.5 10-3.5 15 0s10 3.5 15 0 10-3.5 14 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M12 19c4-3 8-3 12 0s8 3 12 0 8-3 10 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
