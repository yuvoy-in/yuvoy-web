import { describe, it, expect } from "vitest";
import { cspDirectives, enforcedCsp, reportOnlyCsp } from "./csp";

const PROD = { posthogHost: "https://eu.i.posthog.com", dev: false };

function directive(policy: string, name: string): string | undefined {
  return policy.split("; ").find((d) => d === name || d.startsWith(`${name} `));
}

/**
 * Source expressions as TOKENS, not as a substring search.
 *
 * The two wildcards that would gut this policy — a bare `https:` scheme
 * source and a bare `*` — are substrings of perfectly good host sources, so a
 * substring assertion passes when the policy is wrong.
 */
function sources(policy: string, name: string): string[] {
  return (directive(policy, name) ?? "").split(" ").slice(1);
}

/**
 * yuvoy-web#153. The realistic attack on this site is form-jacking: rewriting
 * where the waitlist and operator forms post, and scraping names, phone
 * numbers and email addresses as they are typed. `connect-src` and
 * `form-action` are the two directives that close it.
 */
describe("Content-Security-Policy", () => {
  it("leaves a form-jacker nowhere to send what it scrapes", () => {
    const connect = sources(reportOnlyCsp(PROD), "connect-src");
    expect(connect).toContain("'self'");
    expect(connect).toContain("https://eu.i.posthog.com");
    expect(connect).not.toContain("*");
    expect(connect).not.toContain("https:");
    expect(connect).not.toContain("http:");
  });

  it("closes the exit a rewritten form action would use", () => {
    // A form-jacker does not need `fetch` at all: changing `action` posts the
    // fields on submit, and `connect-src` never sees it.
    expect(directive(reportOnlyCsp(PROD), "form-action")).toBe(
      "form-action 'self'",
    );
    expect(directive(reportOnlyCsp(PROD), "base-uri")).toBe("base-uri 'none'");
    expect(directive(reportOnlyCsp(PROD), "default-src")).toBe(
      "default-src 'none'",
    );
  });

  it("names the PostHog origin only, never a path", () => {
    const connect = sources(reportOnlyCsp(PROD), "connect-src");
    expect(connect.every((s) => !s.includes("/i/"))).toBe(true);
  });

  it("expects no font host, because next/font self-hosts at build", () => {
    // Both `next/font/local` and `next/font/google` download at build time.
    // If a font host ever shows up in a report, how fonts load has changed.
    expect(directive(reportOnlyCsp(PROD), "font-src")).toBe("font-src 'self'");
    expect(reportOnlyCsp(PROD)).not.toContain("gstatic");
  });

  it("never ships eval, or dev's websocket, to a visitor", () => {
    expect(directive(reportOnlyCsp(PROD), "script-src")).not.toContain(
      "unsafe-eval",
    );
    expect(sources(reportOnlyCsp(PROD), "connect-src")).not.toContain("ws:");
    expect(
      directive(reportOnlyCsp({ ...PROD, dev: true }), "script-src"),
    ).toContain("unsafe-eval");
  });

  it("enforces only what cannot break a page that works today", () => {
    const enforced = enforcedCsp(PROD);
    expect(enforced).toBe(
      "object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    );
    expect(enforced).not.toContain("script-src");
    expect(enforced).not.toContain("connect-src");
  });

  it("drops a host it cannot parse rather than emitting a broken source", () => {
    const policy = reportOnlyCsp({ posthogHost: "not a url" });
    expect(policy).not.toContain("undefined");
    expect(policy).not.toContain("not a url");
  });

  it("keeps every directive to one declaration", () => {
    // A repeated directive is not merged — the first wins and the second is
    // silently ignored, which is how a policy ends up looser than it reads.
    const names = cspDirectives(PROD).map((d) => d.split(" ")[0]);
    expect(new Set(names).size).toBe(names.length);
  });
});
