import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * The button system. Two variants are first-class — `primary` (the terracotta
 * call to action) and `outline` (its secondary) — and every screen should
 * reach for those. `ink`, `ghost` and `outlineOnDark` are situational; see
 * docs/DESIGN_SYSTEM.md §5 for when each is allowed.
 *
 * Labels are wide-tracked uppercase bold (v2.3 — the mono went with the
 * serif): an action reads as an action. Transitions sit inside the 250ms
 * interaction budget (design system §3).
 */
const button = cva(
  [
    "inline-flex items-center justify-center gap-2.5 rounded-edge font-sans text-xs font-bold tracking-label uppercase whitespace-nowrap",
    "transition-colors duration-200 ease-[var(--ease-interaction)]",
    "focus-visible:ring-terra-deep focus-visible:ring-offset-cream focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        // cream on terra-deep is 5.21:1 — the lighter `terra` would be 3.4:1
        // and fail AA at label size, which is why the CTA fill is terra-deep.
        primary: "bg-terra-deep text-cream hover:bg-terra-deep/90",
        outline:
          "border-forest/25 text-forest hover:border-forest/45 hover:bg-forest/5 border",
        ink: "bg-forest text-cream hover:bg-forest/90",
        ghost: "text-forest hover:bg-forest/5",
        // Secondary action on a forest section.
        outlineOnDark:
          "border-cream/30 text-cream hover:border-cream/50 hover:bg-cream/10 focus-visible:ring-offset-forest border",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-13 px-8 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(button({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { button as buttonVariants };

/**
 * The trailing arrow on a forward action. Decorative — the label carries the
 * meaning, so it is hidden from assistive tech.
 */
export function ButtonArrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      className="size-3.5 shrink-0"
    >
      <path
        d="M2 8h11M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
    </svg>
  );
}
