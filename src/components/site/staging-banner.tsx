import { IS_PRODUCTION } from "@/lib/site";

/** A small badge on non-production deploys so staging is never mistaken for prod. */
export function StagingBanner() {
  if (IS_PRODUCTION) return null;
  return (
    <div className="bg-forest/90 text-cream fixed bottom-3 left-3 z-50 rounded-full px-3 py-1 text-xs font-medium tracking-wide">
      STAGING
    </div>
  );
}
