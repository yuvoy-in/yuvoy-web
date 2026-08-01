import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  robots: { index: false, follow: false },
};

/**
 * PLACEHOLDER — release blocker.
 *
 * The business-approved Terms replace this page before public launch. Until
 * then it states the only terms that can truthfully exist for a pre-launch
 * registration page.
 */
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10 sm:py-24">
      <h1 className="font-display text-teal text-4xl font-extrabold tracking-tight">
        Terms
      </h1>
      <div className="text-teal/70 mt-6 flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          Yuvoy&rsquo;s full Terms of Service will be published here before
          launch. For this pre-launch page, the position is simple:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Registering interest creates no booking, no payment obligation and
            no guarantee of availability — for travellers or providers.
          </li>
          <li>
            Nothing on this site is an offer of a specific experience, price or
            date.
          </li>
          <li>
            Provider registration starts a conversation; it does not create a
            listing or a partnership.
          </li>
        </ul>
      </div>
      <Link
        href="/"
        className="label tap-target text-teal/75 hover:text-teal mt-10"
      >
        ← Back home
      </Link>
    </main>
  );
}
