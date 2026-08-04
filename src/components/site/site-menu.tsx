"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { WaveMotif } from "@/components/brand/wave-motif";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { MENU_ITEMS, PRIMARY_CTA, SITE_ROUTES } from "@/lib/site/nav";

/**
 * The site navigation panel, at every breakpoint.
 *
 * The header carries only three things — the mark, the operator link and the
 * call to action — so every other route lives in here, on a phone and on a
 * desktop alike. That is why this is no longer conditioned on a breakpoint,
 * and why there is no longer a resize handler closing it: the trigger can
 * never disappear out from under an open panel.
 *
 * Two details that make it feel like a considered object rather than an
 * overlay:
 *
 * - **The close button lands exactly where the trigger was.** The panel's top
 *   bar mirrors the header's: same height, same `container-page` gutters, same
 *   negative margin. Open and close are the same pixel, so a visitor can
 *   dismiss it without moving the pointer at all.
 * - **It opens like a shutter**, unrolling from the top edge to the bottom and
 *   rolling back up on close. That is a clip-path animation, so the content is
 *   revealed in place rather than sliding or scaling into position.
 *
 * Built on a native `<dialog>` opened with `showModal()`, which puts it in the
 * browser's top layer. That buys three things we would otherwise hand-roll and
 * get subtly wrong: a real focus trap, Escape-to-close, and inerting the page
 * behind it for assistive tech. It also cannot be clipped by an ancestor's
 * overflow or stacking context — the bug a portal was previously needed for.
 *
 * What React still owns: mirroring the dialog's own close events back into
 * state (so `aria-expanded` never goes stale), locking background scroll,
 * holding the close back until the shutter has finished, and deciding when
 * returning focus to the trigger is the right thing to do.
 */

/** Must match the closing shutter in globals.css. */
const SHUTTER_CLOSE_MS = 320;

export function SiteMenu({
  tone = "onLight",
}: {
  /** Follows the header surface the trigger sits on. */
  tone?: "onLight" | "onDark";
}) {
  const [open, setOpen] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  /**
   * Whether the next close should hand focus back to the trigger. True for
   * Escape, the backdrop and the close button; false when we close because
   * the page navigated, where focus belongs to the new page instead.
   */
  const restoreFocus = React.useRef(true);
  const pathname = usePathname();

  /**
   * Closing runs the shutter first and dismisses the dialog after it. The
   * wait is a scheduling decision, not a styling one, which is why it asks
   * about the motion preference here: with the animation collapsed there is
   * nothing to wait for, and pausing anyway would just read as lag.
   */
  const close = React.useCallback((restore = true) => {
    restoreFocus.current = restore;
    const instant = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (instant) {
      setOpen(false);
      return;
    }
    setClosing(true);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setClosing(false);
      setOpen(false);
    }, SHUTTER_CLOSE_MS);
  }, []);

  React.useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Drive the native dialog from React state.
  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      // Take focus off whatever showModal() picked (the close button) and
      // park it on the panel, so opening does not paint a focus ring.
      panelRef.current?.focus();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Escape and backdrop dismissal happen in the browser, not in React.
  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    function onClose() {
      setOpen(false);
      setClosing(false);
      if (restoreFocus.current) triggerRef.current?.focus();
      restoreFocus.current = true;
    }
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, []);

  // Lock background scroll for as long as the panel is open.
  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // A Link navigation keeps this component mounted, so close on route change.
  const lastPath = React.useRef(pathname);
  React.useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      close(false);
    }
  }, [pathname, close]);

  const legalLinks = SITE_ROUTES.filter((r) => r.footer === "trust");

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-haspopup="dialog"
        className={cn(
          "rounded-edge -mr-2 inline-flex size-11 items-center justify-center transition-colors duration-300 focus-visible:ring-2 focus-visible:outline-none",
          tone === "onDark"
            ? "text-cream hover:bg-cream/10 focus-visible:ring-terra-soft"
            : "text-forest hover:bg-forest/5 focus-visible:ring-terra-deep",
        )}
      >
        <span className="sr-only">Open menu</span>
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
          <path
            d="M3 7h18M3 12h18M3 17h18"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="square"
          />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        id="site-menu"
        data-menu
        aria-label="Site menu"
        onClick={(event) => {
          // A click landing on the dialog itself is a click on the backdrop:
          // the panel inside covers every other pixel.
          if (event.target === dialogRef.current) close();
        }}
        onCancel={(event) => {
          // Let the close listener own state; just don't let the browser skip it.
          event.preventDefault();
          close();
        }}
        className="m-0 h-dvh max-h-dvh w-screen max-w-none bg-transparent p-0 backdrop:cursor-pointer"
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          data-state={closing ? "closing" : "open"}
          className="menu-shutter bg-cream flex h-full flex-col outline-none"
        >
          {/* Mirrors the header exactly, so the close button sits on the
              same pixel the trigger did. */}
          <div className="border-cream-line container-page flex h-14 shrink-0 items-center justify-between border-b">
            <Wordmark />
            <button
              type="button"
              onClick={() => close()}
              className="text-forest hover:bg-forest/5 focus-visible:ring-terra-deep rounded-edge -mr-2 inline-flex size-11 items-center justify-center transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="sr-only">Close menu</span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                className="size-6"
              >
                <path
                  d="M5 5l14 14M19 5L5 19"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="square"
                />
              </svg>
            </button>
          </div>

          {/*
            Only this region scrolls. The call to action and the legal links
            are pinned below it, so they stay reachable however many routes the
            registry grows to — and cannot be scrolled underneath the panel,
            which is both a usability problem and what made an automated
            contrast check resolve them against the wrong background.
          */}
          <div className="container-page min-h-0 flex-1 overflow-y-auto overscroll-contain py-6 sm:py-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
              <nav aria-label="Site" className="lg:col-span-7">
                {MENU_ITEMS.length > 0 && (
                  <ul className="border-cream-line flex flex-col border-t">
                    {MENU_ITEMS.map((item) => {
                      const current = pathname === item.href;
                      return (
                        <li
                          key={item.href}
                          className="border-cream-line border-b last:border-b-0"
                        >
                          <Link
                            href={item.href}
                            aria-current={current ? "page" : undefined}
                            onClick={() => close(false)}
                            className={cn(
                              "font-display group flex items-baseline justify-between gap-6 py-3.5 text-[clamp(1.375rem,2.8vw,2.25rem)] leading-tight font-normal tracking-tight transition-colors duration-200 sm:py-4",
                              current
                                ? "text-terra-deep"
                                : "text-forest hover:text-terra-deep",
                            )}
                          >
                            {item.label}
                            <span
                              aria-hidden
                              className="text-terra-deep translate-x-0 text-base opacity-0 transition duration-200 group-hover:translate-x-1 group-hover:opacity-100"
                            >
                              →
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </nav>

              {/* The room a desktop has and a phone does not. Informational
                  only, so there is nothing here to miss on a small screen. */}
              <div className="hidden lg:col-span-5 lg:block lg:pt-2">
                <WaveMotif />
                <p className="font-display text-forest mt-6 text-2xl leading-snug tracking-tight text-balance">
                  Season One opens in the Andaman Islands{" "}
                  <em className="text-terra italic">when the water clears.</em>
                </p>
                <p className="text-forest/75 mt-5 max-w-xs leading-relaxed">
                  Havelock, Neil and Port Blair, covered properly, before
                  anywhere else.
                </p>
              </div>
            </div>
          </div>

          <div className="border-cream-line bg-cream container-page shrink-0 border-t py-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={PRIMARY_CTA.href}
                onClick={() => close(false)}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "flex w-full sm:w-auto",
                )}
              >
                {PRIMARY_CTA.label}
                <ButtonArrow />
              </Link>

              {legalLinks.length > 0 && (
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {legalLinks.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => close(false)}
                        className="label tap-target text-forest/75 hover:text-forest"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
