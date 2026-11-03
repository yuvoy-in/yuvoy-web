"use client";

import * as React from "react";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { AUDIENCE_COPY } from "@/lib/site/audiences";
import type { LeadAudience, LeadSource } from "@/lib/leads/registry";
import { TravellerForm } from "./lead-forms-traveller";
import { ProviderForm } from "./lead-forms-provider";

/** Attribution carried from a /go/<source> campaign route. */
export interface LeadContext {
  source: LeadSource;
  destinationKey: string;
}

/* ------------------------------------------------------------------- shell */

/**
 * The form for one audience — the traveller waitlist, or the operator
 * application.
 *
 * The operator side stood as a "Coming soon" notice until 2026-08-07, because
 * the deployed API still required three fields the form had stopped asking
 * for and answered `400` to every complete application. `yuvoy-in/yuvoy-api#4`
 * shipped and the notice went with it; both surfaces that render this (the
 * `/waitlist` operator tab and `/hosts`) got the real form in the same
 * change, which is the point of there being one component.
 *
 * Exported because `/waitlist` composes the two sides itself: there, the
 * audience switch changes the whole page rather than only the form, so it
 * needs the panel without the section around it.
 */
export function LeadFormPanel({
  audience,
  context,
}: {
  audience: LeadAudience;
  context: LeadContext;
}) {
  return audience === "traveller" ? (
    <TravellerForm context={context} />
  ) : (
    <ProviderForm context={context} />
  );
}

/**
 * Registration as a page section: the narrative on the left, the form on the
 * right. Every form posts to POST /v1/leads with the audience discriminator,
 * and every outcome the API can produce — recorded, updated, invalid,
 * rate-limited, unavailable, offline — has its own truthful UI state.
 *
 * **One audience, always.** The homepage speaks to travellers and `/hosts`
 * speaks to operators, and neither should show the other's door. The audience
 * picker that used to live here moved to `/waitlist`, which is the one surface
 * that offers both — and it belongs there rather than here, because choosing a
 * side changes everything on that page, not just which fields are on screen.
 */
export function LeadForms({
  context,
  audience,
  aside,
  sectionId = "register",
}: {
  context: LeadContext;
  audience: LeadAudience;
  /**
   * The narrative column. It **must** contain an element with
   * `id="${sectionId}-heading"` (see `JoinAside` / `ApplyAside`), because it
   * carries the section's heading and this section points its
   * `aria-labelledby` at it.
   */
  aside: React.ReactNode;
  /** The section's anchor id; its heading is `<id>-heading`. */
  sectionId?: string;
}) {
  return (
    <section
      id={sectionId}
      className="bg-forest text-paper scroll-mt-[calc(4rem+env(safe-area-inset-top))]"
      aria-labelledby={`${sectionId}-heading`}
    >
      {/* The legacy operator anchor, wherever a provider form actually lives,
          so the browser has something to scroll to. The homepage no longer
          offers that form and redirects the anchor instead (see
          LegacyProviderAnchor). */}
      {audience === "provider" && (
        <span
          id="providers"
          className="block scroll-mt-[calc(5rem+env(safe-area-inset-top))]"
          aria-hidden
        />
      )}
      {/*
        Three cells, and the source order is the PHONE's order: headline, then
        the form, then the questions.

        Stacked into one column the old two-cell version read headline →
        questions → form, so a visitor on a phone had to scroll past every FAQ
        to reach the thing the section is asking them to do (owner report,
        2026-08-10). Desktop was right and is unchanged: the questions sit
        under the headline on the left and the form holds the right.

        That is why the form is its own cell rather than living inside the
        aside — with explicit placement the same DOM serves both orders, so
        nothing is reordered by CSS alone and the focus order a keyboard user
        gets is the reading order everyone else gets.

        `grid-rows-[auto_1fr]`: a form taller than the column beside it should
        grow the QUESTIONS row. With two auto rows grid splits the excess
        between them and opens a gap between the headline and the first
        question. This is the same shape `WaitlistFlow` uses, for the same
        reason.
      */}
      <div className="container-page py-14 sm:py-28">
        <div className="grid grid-cols-1 gap-10 sm:gap-14 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-14">
          <div className="lg:col-start-1 lg:row-start-1">{aside}</div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <LeadFormPanel audience={audience} context={context} />
          </div>

          {/* Rendered here rather than inside the aside so it can be placed
              independently. It also puts the questions in one place for all
              three surfaces that ask them, keyed off the audience this
              section already knows. */}
          <div className="lg:col-start-1 lg:row-start-2">
            <FaqAccordion items={AUDIENCE_COPY[audience].faqs} tone="ink" />
          </div>
        </div>
      </div>
    </section>
  );
}
