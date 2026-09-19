import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * `text-base` on touch, `text-sm` where there is a real pointer.
 *
 * **This is not a sizing preference; it is the iOS zoom bug.** Mobile Safari
 * zooms the whole page when a field with a computed font-size under 16px takes
 * focus, and the page has no `maximum-scale` to suppress it (nor should it —
 * that is a WCAG 1.4.4 failure). At `text-sm` every field on this site
 * therefore lurched the layout on tap, left the visitor at ~1.14x with the
 * page wider than the screen, and made them pinch back out to carry on. It hit
 * the waitlist form first, which is the site's primary conversion, and the
 * platform it hit is the one carrying most of the traffic.
 *
 * The gate is `pointer-fine`, not a width breakpoint, because the bug follows
 * the input method rather than the viewport: an iPhone in landscape is 844px
 * wide and still zooms, so `sm:text-sm` would have left the defect in place
 * for anyone who rotated the phone. A touchscreen laptop reports a fine
 * primary pointer, does not auto-zoom, and keeps the denser 14px field.
 *
 * The same pair is used by `PhoneField` and by the contact form's own
 * `<select>` and `<textarea>`, which are not built on this primitive. All four
 * have to move together or the bug simply relocates.
 */
const input = cva(
  "rounded-edge h-12 w-full border px-4 text-base transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 pointer-fine:text-sm",
  {
    variants: {
      tone: {
        onLight:
          "border-forest/20 bg-paper-deep text-forest placeholder:text-forest/70 focus-visible:border-terra-deep focus-visible:ring-terra-deep/30",
        onDark:
          "border-paper/20 bg-paper/5 text-paper placeholder:text-paper/60 focus-visible:border-terra-soft focus-visible:ring-terra-soft/40",
      },
    },
    defaultVariants: { tone: "onLight" },
  },
);

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "color">,
    VariantProps<typeof input> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, tone, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(input({ tone }), className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { input as inputVariants };
