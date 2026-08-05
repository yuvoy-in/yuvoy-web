import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * The button system. On light surfaces the first-class pair is `primary`
 * (solid forest) and `outline`; on forest surfaces it is `paper` (solid
 * cream) and `outlineOnDark`. `ghost` is situational; see
 * docs/DESIGN_SYSTEM.md §5 for when each is allowed.
 *
 * Labels are wide-tracked uppercase bold (v2.3 — the mono went with the
 * serif): an action reads as an action, set in the text face.
 *
 * The premium is in the touch, not the shape (2026-08-05): a press compresses
 * the button (`active:scale`), a hover lifts it a pixel, and the trailing
 * arrow eases forward — all on the interaction curve, all inside the 250ms
 * budget (design system §3). The group is named (`group/btn`) so the arrow
 * answers only its own button, never an ancestor card's hover.
 */
const button = cva(
  [
    "group/btn inline-flex items-center justify-center gap-2.5 rounded-edge font-sans text-xs font-bold tracking-label uppercase whitespace-nowrap",
    "transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-interaction)]",
    "hover:-translate-y-px active:translate-y-0 active:scale-[0.985]",
    "focus-visible:ring-terra-deep focus-visible:ring-offset-cream focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        /*
          CTAs are monochrome (owner direction, 2026-08-05): the site's two
          grounds simply swap — forest fill on cream surfaces, cream fill on
          forest ones — both 11.44:1. Terracotta is an accent for type and
          marks, never a button fill; the old terra-deep CTA read as the
          template it came from.
        */
        primary: "bg-forest text-cream hover:bg-forest/90",
        outline:
          "border-forest/25 text-forest hover:border-forest/45 hover:bg-forest/5 border",
        // The primary on a forest section: paper on the dark ground.
        paper:
          "bg-cream text-forest hover:bg-cream/90 focus-visible:ring-terra-soft focus-visible:ring-offset-forest",
        ghost: "text-forest hover:bg-forest/5",
        // Secondary action on a forest section.
        outlineOnDark:
          "border-cream/30 text-cream hover:border-cream/50 hover:bg-cream/10 focus-visible:ring-offset-forest border",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-7",
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
 * meaning, so it is hidden from assistive tech. It eases forward when its own
 * button (`group/btn`) is hovered: the action points where it is about to go.
 */
export function ButtonArrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      className="size-3.5 shrink-0 transition-transform duration-200 ease-[var(--ease-interaction)] group-hover/btn:translate-x-0.5"
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
