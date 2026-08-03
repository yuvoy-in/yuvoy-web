import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const input = cva(
  "rounded-edge h-12 w-full border px-4 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      tone: {
        onLight:
          "border-forest/20 bg-cream-deep text-forest placeholder:text-forest/70 focus-visible:border-terra-deep focus-visible:ring-terra-deep/30",
        onDark:
          "border-cream/20 bg-cream/5 text-cream placeholder:text-cream/60 focus-visible:border-terra-soft focus-visible:ring-terra-soft/40",
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
