import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

export function SiteFooter() {
  return (
    <footer className="border-cream-line/70 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div>
          <Wordmark />
          <p className="text-forest/55 mt-2 max-w-xs text-sm">
            Immersive experiences in the Andaman Islands. Opening October 2026.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/experiences"
            className="text-forest/60 hover:text-forest text-sm"
          >
            Experiences
          </Link>
          <Link
            href="/philosophy"
            className="text-forest/60 hover:text-forest text-sm"
          >
            Philosophy
          </Link>
          <Link
            href="/waitlist"
            className="text-forest/60 hover:text-forest text-sm"
          >
            Waitlist
          </Link>
        </nav>
      </div>
      <div className="border-cream-line/50 border-t px-6 py-5 text-center sm:px-10">
        <span className="label text-forest/40">Experience More.</span>
      </div>
    </footer>
  );
}
