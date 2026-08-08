"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Whether this visit has moved between routes yet.
 *
 * ## What it is for
 *
 * A back control has one hard case: the visit whose **first** entry is the
 * page the control is on — a link opened in a new tab, a scanned QR code, a
 * bookmark. `history.back()` does nothing there, and a control that does
 * nothing reads as a broken page, so it has to go somewhere sensible instead.
 *
 * Nothing the browser exposes answers "is there one of ours behind me?" on its
 * own:
 *
 * - `history.length` counts entries, not *whose*. It is 1 on a real direct
 *   arrival, but any preceding page — another site, or a harness's initial
 *   `about:blank` — makes it 2 with nothing of ours behind us.
 * - `document.referrer` belongs to the **document**, and App Router
 *   navigations never load a new one. Walking `/` → `/waitlist` through a link
 *   leaves it exactly as it was on `/`, which is empty for anyone who typed
 *   the address.
 * - The Navigation API answers it exactly, and is still missing from Firefox.
 *
 * So this records the one thing neither of them knows: that the router has
 * moved at least once, which means there is a page of ours behind us.
 *
 * ## How it is used
 *
 * `WaitlistChrome` goes back when this is true *or* when there is an entry
 * behind us that a referrer proves is real. Otherwise it goes home.
 *
 * A referrer stripped by a privacy setting or an in-app browser therefore
 * lands somebody on the homepage rather than off the site. That is the right
 * way round to be wrong: the failure returns a visitor to the top of the site
 * they were already on, rather than firing them out of it.
 *
 * Module state, deliberately — not `sessionStorage`. The question is about
 * *this document's* session history, and a reload starts a fresh one: a value
 * that survived the reload would claim a previous page that the back button
 * can no longer reach.
 */
let routeChanges = 0;

/** True once the router has navigated within the app during this visit. */
export function hasInternalHistory(): boolean {
  return routeChanges > 0;
}

/**
 * Counts route changes. Renders nothing, and belongs in the root layout so it
 * sees every navigation, including the ones that happen long before a page
 * with a back control is reached.
 */
export function NavigationHistory() {
  const pathname = usePathname();
  const first = React.useRef(true);

  React.useEffect(() => {
    // The first run is this document arriving, not a navigation within it.
    if (first.current) {
      first.current = false;
      return;
    }
    routeChanges += 1;
  }, [pathname]);

  return null;
}
