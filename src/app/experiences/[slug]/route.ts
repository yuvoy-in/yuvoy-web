import { gone } from "@/lib/gone";

/**
 * Retired experience detail pages.
 *
 * `/experiences` itself is a real page again, but the **detail** slugs under
 * it are not, and must keep answering 410. The pre-launch site published
 * seeded experience pages (`/experiences/sunrise-scuba-dive` and friends)
 * carrying invented prices and review counts; those URLs were indexed, and a
 * 410 is what gets them dropped rather than revisited.
 *
 * This is a single dynamic segment on purpose, not an optional catch-all —
 * an optional catch-all cannot coexist with `page.tsx` at this route.
 *
 * When real experience detail pages are built, this file becomes a `page.tsx`
 * and the 410 moves to an explicit list of the retired slugs.
 */
export function GET() {
  return gone();
}
