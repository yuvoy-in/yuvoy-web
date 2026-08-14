import { IS_PRODUCTION } from "@/lib/site";

/** A small badge on non-production deploys so staging is never mistaken for prod. */
export function StagingBanner() {
  if (IS_PRODUCTION) return null;
  return (
    <div className="bg-forest/90 text-cream fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] z-50 rounded-full px-3 py-1 text-xs font-medium tracking-wide">
      STAGING
    </div>
  );
}
