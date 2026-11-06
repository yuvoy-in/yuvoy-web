/**
 * What the two vercel-pickup test files share (yuvoy-web#188). Not a test
 * file itself: vitest only collects `*.test.ts`.
 */
import { VERCEL_STATUS_CONTEXT } from "../../scripts/vercel-pickup.mjs";

/** The status Vercel posts for yuvoy.in within seconds of a push. */
export function vercelStatus(
  state: string,
  created_at = "2026-10-10T13:40:04Z",
) {
  return {
    context: VERCEL_STATUS_CONTEXT,
    state,
    created_at,
    creator: { login: "vercel[bot]" },
  };
}
