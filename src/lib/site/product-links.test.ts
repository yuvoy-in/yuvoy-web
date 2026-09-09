import { describe, it, expect } from "vitest";
import {
  APP_URL,
  OPERATOR_PORTAL_URL,
  appHref,
  operatorPortalHref,
} from "./product-links";

/**
 * yuvoy-web#154. Both product hosts are live and this site links to them.
 *
 * The parameters matter more than they look: the app reads exactly four —
 * `src`, `code`, `placement`, `campaign` — and silently drops everything else,
 * so a link that carries `utm_source` records nothing at all.
 */
describe("appHref", () => {
  it("goes to the app, absolutely", () => {
    // A root-relative path would resolve to the marketing site and 404.
    expect(appHref("hero").startsWith(`${APP_URL}/`)).toBe(true);
  });

  it("carries src=web, the value the API had to grow", () => {
    /*
      `web` was not on `Attribution.source` until yuvoy-api#135. The obvious
      link — `?src=web` — would have failed validation and the app would have
      recorded NO attribution at all, because it drops the whole object when
      `src` is unrecognised rather than falling back to `unknown`.
    */
    const url = new URL(appHref("header"));
    expect(url.searchParams.get("src")).toBe("web");
  });

  it("says which door was tapped", () => {
    // "Which card, which boat, which door." Two spellings of the same
    // placement are two rows in a report nobody can read, so the set is closed.
    expect(new URL(appHref("footer")).searchParams.get("placement")).toBe(
      "footer",
    );
  });

  it("passes a campaign arrival through, and only a real one", () => {
    /*
      The site's own `/go/<source>` scheme and the app's scans table answer
      different questions and stay separate. The only bridge is `campaign`,
      which is free text on the contract — forcing a campaign into the `src`
      enum would have no room for it.
    */
    expect(new URL(appHref("hero", "ferry")).searchParams.get("campaign")).toBe(
      "ferry",
    );
    // `web` is the default source for organic traffic here, so `campaign=web`
    // would be a parameter that says nothing and can be shared and indexed.
    expect(new URL(appHref("hero", "web")).searchParams.get("campaign")).toBe(
      null,
    );
    expect(new URL(appHref("hero")).searchParams.get("campaign")).toBe(null);
  });

  it("never sends a parameter the app ignores", () => {
    // `utm_*` and `ref` are dropped silently at the other end, so a link
    // carrying them is a link that looks tracked and is not.
    const url = new URL(appHref("explore", "instagram"));
    for (const key of [...url.searchParams.keys()]) {
      expect(["src", "code", "placement", "campaign"]).toContain(key);
    }
  });
});

describe("operatorPortalHref", () => {
  it("opens the signup door, not the portal root", () => {
    /*
      The root redirects through `/today` to `/sign-in`, which is the wrong
      door for somebody who has no account yet — and this link is the one
      labelled "Set your business up".
    */
    expect(operatorPortalHref()).toBe(`${OPERATOR_PORTAL_URL}/signup`);
  });

  it("carries no attribution, because the portal reads none", () => {
    // It has no capture and no scans table. Parameters here would be
    // decoration that survives into somebody's address bar.
    expect(operatorPortalHref()).not.toContain("?");
  });
});
