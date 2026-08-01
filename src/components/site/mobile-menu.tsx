"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, PRIMARY_CTA, SITE_ROUTES } from "@/lib/site/nav";

/**
 * The mobile navigation panel.
 *
 * Built on a native `<dialog>` opened with `showModal()`, which puts it in the
 * browser's top layer. That buys three things we would otherwise hand-roll and
 * get subtly wrong: a real focus trap, Escape-to-close, and inerting the page
 * behind it for assistive tech. It also cannot be clipped by an ancestor's
 * overflow or stacking context — the bug a portal was previously needed for.
 *
 * What React still owns: mirroring the dialog's own close events back into
 * state (so `aria-expanded` never goes stale), locking background scroll, and
 * deciding when returning focus to the trigger is the right thing to do.
 */
export function MobileMenu() {
  const [open, setOpen] = React.useState(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  /**
   * Whether the next close should hand focus back to the trigger. True for
   * Escape, the backdrop and the close button; false when we close because
   * the page navigated, where focus belongs to the new page instead.
   */
  const restoreFocus = React.useRef(true);
  const pathname = usePathname();

  const close = React.useCallback((restore = true) => {
    restoreFocus.current = restore;
    setOpen(false);
  }, []);

  // Drive the native dialog from React state.
  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  // Escape and backdrop dismissal happen in the browser, not in React.
  React.useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    function onClose() {
      setOpen(false);
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

  // Growing past the breakpoint hides the trigger — don't strand an open panel
  // with no visible way back to it.
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    function onChange() {
      if (mq.matches) close(false);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [close]);

  const legalLinks = SITE_ROUTES.filter((r) => r.footer === "trust");

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-haspopup="dialog"
        className="text-teal hover:bg-teal/5 focus-visible:ring-terra-deep rounded-edge -mr-2 inline-flex size-11 items-center justify-center transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none lg:hidden"
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
        id="mobile-menu"
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
        className="bg-cream m-0 h-dvh max-h-dvh w-screen max-w-none p-0 backdrop:cursor-pointer"
      >
        <div className="menu-in flex h-full flex-col">
          <div className="border-cream-line flex h-16 shrink-0 items-center justify-between border-b px-6">
            <Wordmark />
            <button
              type="button"
              onClick={() => close()}
              className="text-teal hover:bg-teal/5 focus-visible:ring-terra-deep rounded-edge -mr-2 inline-flex size-11 items-center justify-center transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none"
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

          <nav
            aria-label="Site"
            className="flex-1 overflow-y-auto overscroll-contain px-6 py-8"
          >
            {NAV_ITEMS.length > 0 && (
              <ul className="flex flex-col">
                {NAV_ITEMS.map((item) => {
                  const current = pathname === item.href;
                  return (
                    <li key={item.href} className="border-cream-line border-b">
                      <Link
                        href={item.href}
                        aria-current={current ? "page" : undefined}
                        onClick={() => close(false)}
                        className={cn(
                          "font-display block py-5 text-2xl font-bold tracking-tight",
                          current ? "text-terra-deep" : "text-teal",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <Link
              href={PRIMARY_CTA.href}
              onClick={() => close(false)}
              className={cn(buttonVariants({ size: "lg" }), "mt-8 flex w-full")}
            >
              {PRIMARY_CTA.label}
              <ButtonArrow />
            </Link>

            {legalLinks.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {legalLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => close(false)}
                      className="label text-teal/75 hover:text-teal"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>
      </dialog>
    </>
  );
}
