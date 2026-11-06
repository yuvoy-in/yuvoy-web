/**
 * What the three shell specs share: the routes, the phone viewport and the
 * menu opener (yuvoy-web#188).
 */
import { expect, type Page } from "./session";

/**
 * Routes that exist today and must all render inside the shell.
 *
 * `/waitlist` is in here on purpose even though it suppresses the site header:
 * what this list asserts is that every route has a `banner` carrying the mark
 * and a `contentinfo` beneath it, and that route satisfies both with its own
 * masthead (`WaitlistChrome`). What is *specific* to it — no site nav, a back
 * control, a centred mark — is asserted in `waitlist.spec.ts`.
 */
export const SHELL_ROUTES = [
  "/",
  "/explore",
  "/waitlist",
  "/hosts",
  "/contact",
  "/safety",
  "/destinations/havelock",
  "/about",
  "/journal",
  "/journal/why-the-andamans",
  "/go/ferry",
  "/privacy",
  "/terms",
  // Reached by its link only, never the menu (yuvoy-web#177). With no API
  // stub here it shows "soon", which is what a visitor sees today.
  "/submit",
];

export const MOBILE = { width: 390, height: 844 };

export async function openMenu(page: Page) {
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  // Let the entrance animation settle. Contrast is only a WCAG concern in the
  // settled state, and sampling mid-fade reports the panel composited against
  // the backdrop rather than its own background.
  await page
    .getByRole("dialog", { name: "Site menu" })
    .locator("> div")
    .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  return trigger;
}
