import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-cream-line/70 bg-cream/80 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" aria-label="Yuvoy home">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/experiences"
            className="label text-forest/55 hover:text-forest transition-colors"
          >
            Experiences
          </Link>
          <Link
            href="/philosophy"
            className="label text-forest/55 hover:text-forest transition-colors"
          >
            Philosophy
          </Link>
          <Link href="/waitlist" className={buttonVariants({ size: "sm" })}>
            Waitlist
          </Link>
        </nav>
      </div>
    </header>
  );
}
