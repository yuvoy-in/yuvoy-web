"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { hasInternalHistory } from "@/components/site/navigation-history";

/**
 * The masthead `/waitlist` wears instead of the site header.
 *
 * ## Why the site header comes off here
 *
 * Every other route wants navigation. This one wants a form filled in. The
 * standing header carries Explore, For Operators, About and a "Join Waitlist"
 * button — three ways off the page and one that points at the page you are
 * already on, which is the shape of a header that has stopped reading its own
 * route. In its place: the mark, centred, and one way back.
 *
 * `SiteHeader` suppresses itself on the routes named by `hidesSiteChrome`
 * (see `@/lib/site/nav`), so the two can never both render.
 *
 * This is still a `<header>` and still the page's `banner` landmark — it is a
 * direct child of the layout's content wrapper, not of `<main>`, so the role
 * is implicit and correct. What it is *not* is sticky: the site bar slides
 * away and returns because long editorial pages need it back; a focused page
 * shorter than that reads better with a masthead that simply sits at the top,
 * where print puts it.
 *
 * ## Back, and what "back" means when there is nowhere to go
 *
 * `router.back()` returns the visitor to wherever they actually came from —
 * the homepage, a campaign route, a search result, another site. That is what
 * a back control promises, and anything smarter (a hardcoded "/" or a
 * remembered referrer) would quietly lie to somebody.
 *
 * The one case it cannot serve is a visit whose first entry *is* this page: a
 * link opened in a new tab, a scanned QR code, a bookmark. `back()` does
 * nothing there, and a control that does nothing reads as a broken page — so
 * it goes home instead.
 *
 * Telling the two apart takes both signals, because neither is enough on its
 * own (the reasoning is in `navigation-history.tsx`): the router having moved
 * during this visit, which proves a page of ours is behind us, or an entry
 * behind us that a referrer proves is a real page rather than a blank tab.
 *
 * The check runs in the click handler rather than during render on purpose:
 * reading `window.history` while rendering would differ between the server
 * pass and the client one, which is a hydration mismatch by construction.
 *
 * Tab changes on this page use `history.replaceState` (see `WaitlistFlow`)
 * precisely so this button keeps that promise — pushing a history entry per
 * tab would mean "back" walked through the tabs the visitor had tried before
 * it ever left the page.
 */
export function WaitlistChrome() {
  const router = useRouter();

  function goBack() {
    const cameFromAnotherPage =
      window.history.length > 1 && document.referrer !== "";
    if (hasInternalHistory() || cameFromAnotherPage) {
      router.back();
      return;
    }
    router.push("/");
  }

  return (
    <header className="bg-forest text-cream pt-[env(safe-area-inset-top)]">
      {/*
        Three columns, the outer two equal, so the mark sits at the true centre
        of the page rather than at the midpoint of whatever the back control
        leaves over. The third cell is deliberately empty — a `1fr` track is
        sized by free space, not by content, so it needs no spacer element.
      */}
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 sm:h-20 sm:gap-4">
        <button
          type="button"
          onClick={goBack}
          className="label text-cream/70 hover:text-cream focus-visible:ring-terra-soft rounded-edge ease-interaction inline-flex h-9 items-center gap-2 justify-self-start px-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
        >
          {/* Decorative: the label carries the meaning. Drawn to the same
              spec as `ButtonArrow` — 1.75 stroke, square caps — so the two
              arrows on the site are the same arrow. */}
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            fill="none"
            className="size-3.5 shrink-0"
          >
            <path
              d="M14 8H3M7 4L3 8l4 4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="square"
            />
          </svg>
          Back
        </button>

        {/*
          The lockup, one step smaller than the site header's below `sm`: the
          drawing is ~3.6:1, and at `h-10` the three cells together overflow a
          320px viewport. `h-9` clears it with room, and from `sm` up this is
          the full-size mark.
        */}
        <Link
          href="/"
          aria-label="Yuvoy home"
          className="focus-visible:ring-terra-soft rounded-edge flex justify-self-center focus-visible:ring-2 focus-visible:outline-none"
        >
          <Wordmark tone="onDark" className="h-9 sm:h-12" />
        </Link>
      </div>
    </header>
  );
}
