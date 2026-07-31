import { cn } from "@/lib/cn";

/**
 * The Yuvoy wordmark — wide-tracked display caps with the terra enso dot.
 * `dot={false}` for tight contexts (e.g. inline in body copy).
 */
export function Wordmark({
  className,
  dot = true,
}: {
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-display text-teal text-base font-semibold",
        className,
      )}
    >
      <span className="tracking-wordmark">YUVOY</span>
      {dot && <span className="text-terra">.</span>}
    </span>
  );
}
