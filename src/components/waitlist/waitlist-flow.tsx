"use client";

import * as React from "react";
import { AudienceTabs } from "@/components/waitlist/audience-tabs";
import { FaqAccordion } from "@/components/site/faq-accordion";
import {
  LeadFormPanel,
  type LeadContext,
} from "@/components/landing/lead-forms";
import { useAnalytics } from "@/components/analytics/analytics-provider";
import { audienceSelected } from "@/lib/analytics/events";
import { AUDIENCE_COPY } from "@/lib/site/audiences";
import type { LeadAudience } from "@/lib/leads/registry";

/**
 * `/waitlist`, both sides of it.
 *
 * ## Two tabs of *page*, not two tabs of form
 *
 * The switch used to sit above two forms and change only those. Everything a
 * visitor actually read — the eyebrow, the headline, the promise under it, the
 * questions beside it — was the traveller's, on both tabs, so an operator
 * arriving at `?audience=provider` was told they were joining a waitlist right
 * up until the submit button said otherwise.
 *
 * Selecting a tab now changes the whole panel: the act it is named after
 * ("Early access" / "Applying"), the headline, the sentence under it, the
 * questions, the form, and the route's own `<title>`. All of it comes from
 * `AUDIENCE_COPY`, which is also what the homepage's closing ask and the
 * operator page's application read — so the two sides say the same thing here
 * as they do where each of them lives.
 *
 * ## The questions belong beside the form, not under it
 *
 * They are the things still going through somebody's head *while* they fill it
 * in — "can I book today?", "does applying cost anything?" — which is the same
 * arrangement the homepage and `/operators` already use. On a phone they sit
 * after the form rather than before it: a visitor who arrived to register
 * should reach the first field without scrolling past an accordion, and the
 * one with a question will scroll for it.
 *
 * ## Only the selected panel is rendered
 *
 * Two mounted panels would mean two `<h1>`s in the document — one of them
 * hidden, both of them real to a crawler — and two live forms competing for
 * the browser's autofill. The cost is that switching sides discards anything
 * typed, which is the honest outcome: a waitlist signup and an operator
 * application are different submissions, not two views of one.
 *
 * The unselected tab keeps its `aria-controls` pointing at a panel that is not
 * in the DOM. That is deliberate and it is not a violation: the ARIA idref
 * check is defined not to apply to a control with `aria-selected="false"`.
 */
export function WaitlistFlow({
  context,
  initialAudience,
}: {
  context: LeadContext;
  /** Resolved server-side from `?audience=`, so the first paint is correct. */
  initialAudience: LeadAudience;
}) {
  const [audience, setAudience] = React.useState<LeadAudience>(initialAudience);
  const { capture } = useAnalytics();
  const copy = AUDIENCE_COPY[audience];

  /*
    `audience_selected` has three trigger points and one shape. The query-param
    preselect fires once on mount; the tab fires on an actual change, so a page
    opened at `?audience=provider` does not report itself twice.
  */
  const reportedPreselect = React.useRef(false);
  React.useEffect(() => {
    if (reportedPreselect.current) return;
    reportedPreselect.current = true;
    if (initialAudience !== "traveller") {
      capture(
        audienceSelected({ audience: initialAudience, trigger: "query_param" }),
      );
    }
  }, [capture, initialAudience]);

  /*
    The selected audience, mirrored into a ref.

    `select` has to know the current side to ignore a no-op, and it has to stay
    referentially stable — the hash listener below depends on it, and a
    `select` that changed identity on every switch would tear down and re-add
    that listener each time. Reading the ref does both, and it keeps the
    analytics call out of the state updater, which React is free to run twice.
  */
  const audienceRef = React.useRef(initialAudience);

  const select = React.useCallback(
    (next: LeadAudience, trigger: "tab" | "cta") => {
      if (audienceRef.current === next) return;
      audienceRef.current = next;
      setAudience(next);
      capture(audienceSelected({ audience: next, trigger }));

      /*
        The address bar follows the tab, so the page can be shared, reloaded or
        bookmarked on the side the visitor is actually looking at.

        `history.replaceState`, for two reasons. It is a **replace**, so the
        back control still leaves the page rather than walking back through
        every tab that was tried — see `WaitlistChrome`, which makes exactly
        that promise. And it is the **native** call rather than
        `router.replace`, which Next.js supports precisely for this: it
        rewrites the URL without a server round-trip, so switching tabs costs
        nothing and cannot scroll or re-render the page underneath the switch.

        The hash goes with it. `#providers` is a legacy entry point (below);
        leaving it behind on the traveller tab would put the page back on the
        operator side on the next reload.
      */
      const params = new URLSearchParams(window.location.search);
      if (next === "traveller") params.delete("audience");
      else params.set("audience", AUDIENCE_COPY[next].param);
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}`,
      );
    },
    [capture],
  );

  /*
    `#providers` deep-links straight onto the operator side.

    That anchor is a long-lived contract: `/waitlist` was once a permanent
    (308) redirect onto `/#providers`, browsers cache 308s indefinitely, and
    the URL was printed on operator materials. It stays wired for as long as
    that paper exists.
  */
  React.useEffect(() => {
    function syncFromHash() {
      if (window.location.hash === "#providers") select("provider", "cta");
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [select]);

  return (
    /*
      `data-dark-hero` here marks the canvas, not the header: /waitlist hides
      the site header entirely (its masthead is WaitlistChrome), but the
      body:has() rule in globals.css reads the same attribute to paint the
      page canvas forest, so the top overscroll and Safari's status strip
      agree with this page's dark ground exactly as they do on the cover
      routes. The header hook is unaffected — it never runs a measurement on
      a route where SiteHeader returns null.
    */
    <main data-dark-hero className="bg-forest text-paper">
      {/* The legacy operator anchor. It must exist for the browser to have
          something to scroll to when the hash arrives with the document. */}
      <span
        id="providers"
        className="block scroll-mt-[calc(6rem+env(safe-area-inset-top))]"
        aria-hidden
      />

      <div className="container-page pt-10 pb-20 sm:pt-14 sm:pb-28">
        <AudienceTabs
          value={audience}
          onSelect={(next) => select(next, "tab")}
        />

        {/*
          Two columns from `lg`: the narrative and its questions on the left,
          the form on the right. The rows are `auto` then `1fr` so a form
          taller than the column beside it grows the *questions* row — with two
          auto rows, grid would split the excess between them and open a gap
          between the headline and the first question.

          Source order is the phone's order: headline, form, questions.
        */}
        <div
          key={audience}
          role="tabpanel"
          id={`panel-${audience}`}
          aria-labelledby={`tab-${audience}`}
          className="mt-14 grid grid-cols-1 gap-x-16 gap-y-14 sm:mt-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-20"
        >
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="eyebrow text-terra-soft">{copy.eyebrow}</p>
            <h1 className="font-display tracking-display mt-6 text-[clamp(2.125rem,5vw,3.375rem)] leading-[1.04] font-normal text-balance">
              {copy.title}{" "}
              <em className="text-terra-soft font-turn italic">
                {copy.accent}
              </em>
            </h1>
            <p className="text-paper/70 mt-6 max-w-md text-lg leading-relaxed">
              {copy.lede}
            </p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <LeadFormPanel audience={audience} context={context} />
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            <FaqAccordion items={copy.faqs} tone="ink" />
          </div>
        </div>
      </div>
    </main>
  );
}
