/**
 * Route-level loading state.
 *
 * The label itself never animates: pulsing text opacity drops it below the AA
 * contrast floor at the bottom of the cycle (axe caught this at 4.34:1). The
 * motion lives on a decorative rule instead, which carries no information and
 * is hidden from assistive tech. The `role="status"` announcement is what
 * screen-reader users get.
 */
export default function Loading() {
  return (
    <div
      role="status"
      className="bg-paper flex min-h-svh flex-col items-center justify-center gap-4"
    >
      <span className="label text-forest/75">Loading Yuvoy</span>
      <span
        aria-hidden
        className="bg-terra/70 h-px w-16 origin-left animate-pulse"
      />
    </div>
  );
}
