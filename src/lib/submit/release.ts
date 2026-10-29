import type { components } from "@/lib/api/schema";

export type AppConfig = components["schemas"]["AppConfig"];

/**
 * Whether `/submit` may show its form: only when `checkedCities` is `all`.
 *
 * This site has no sign-in, so its visitor is never in the staff or early
 * cohort and those stages never open the form here (yuvoy-web#177). Anything
 * else is closed: another stage, no `checkedCities` key, no `releases` at all
 * (an API older than the key), or no config because the call failed. The API
 * applies the same rule and answers `404`, so a page that guessed open would
 * only collect an event it cannot send.
 */
export function organiserFormOpen(
  config: Pick<AppConfig, "releases"> | null | undefined,
): boolean {
  return config?.releases?.checkedCities === "all";
}
