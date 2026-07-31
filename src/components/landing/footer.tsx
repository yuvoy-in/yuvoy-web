import { Wordmark } from "@/components/brand/wordmark";

/** Landing footer. No launch date, no unapproved contact channels. */
export function Footer() {
  return (
    <footer className="border-cream-line/70 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div>
          <Wordmark />
          <p className="text-teal/55 mt-2 max-w-xs text-sm">
            Real local experiences — starting in the Andaman Islands this
            season, building for the world.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="#register" className="text-teal/60 hover:text-teal text-sm">
            Register interest
          </a>
          <a href="#providers" className="text-teal/60 hover:text-teal text-sm">
            For providers
          </a>
          <a href="/privacy" className="text-teal/60 hover:text-teal text-sm">
            Privacy
          </a>
          <a href="/terms" className="text-teal/60 hover:text-teal text-sm">
            Terms
          </a>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-8 sm:px-10">
        <p className="text-teal/40 text-xs">
          © {new Date().getFullYear()} Yuvoy. Booking, payments and listings
          arrive when they&rsquo;re real — nothing on this page simulates them.
        </p>
      </div>
    </footer>
  );
}
