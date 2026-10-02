import Image from "next/image";
import { Wordmark } from "@/components/brand/wordmark";
import { buttonVariants, ButtonArrow } from "@/components/ui/button";
import { readLiveListing, type LiveListing } from "@/lib/api/live-listing";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format/money";
import { appHref, appListingHref } from "@/lib/site/product-links";

/**
 * The why act's right half: one real listing from the app, and the three
 * things a traveller does with it (yuvoy-web#171).
 *
 * It replaced `ProductDemo`, a five-screen auto-playing tour of an invented
 * operator ("Blue Season Divers"), invented prices, an invented seat count and
 * an invented booking reference, captioned "Sample preview". A caption does
 * not make a made-up operator honest on a site that also has real ones, and
 * the site's own rule is no invented names, prices or counts. So the phone now
 * shows the newest listing on the app's browse surface, read from the API (see
 * `@/lib/api/live-listing` for what it carries and what it leaves out), and
 * the whole screen opens that listing in the app.
 *
 * When there is no listing to show, nothing stands in for one: the panel says
 * where the listings are and links there.
 */
export async function LiveListingPanel() {
  return <ListingPanel listing={await readLiveListing()} />;
}

export function ListingPanel({ listing }: { listing: LiveListing | null }) {
  return (
    <div
      data-listing-panel
      /*
        `flex-col-reverse` below `lg`: the steps are written after the phone
        and painted above it (owner direction, 2026-08-15: the steps come
        first on a phone). Nothing in the steps is focusable, so the only
        thing DOM order decides is reading order, and there the listing comes
        first everywhere.
      */
      className="flex flex-col-reverse items-center gap-6 sm:gap-8 lg:flex-row lg:gap-7"
    >
      {listing ? <ListingPhone listing={listing} /> : <NoListing />}
      <Steps />
    </div>
  );
}

/**
 * The listing, on the phone frame the tour used.
 *
 * The frame is unchanged, bezel, keys and size, because the scatter opposite
 * is budgeted against its height (see `.hunt-scatter` in globals.css).
 */
export function ListingPhone({ listing }: { listing: LiveListing }) {
  const kind = [listing.activity, listing.place].filter(Boolean).join(" · ");

  return (
    <div
      data-live-listing
      className="relative flex w-fit flex-none flex-col items-center"
    >
      {/* The bezel's padding and the screen's radius are one measurement, as
          they were on the tour: `--radius-device` minus the padding keeps the
          two curves concentric. */}
      <div className="rounded-device bg-device device-frame relative w-fit p-1">
        <span
          aria-hidden
          className="bg-paper/20 absolute top-3.5 left-1/2 z-10 size-1.5 -translate-x-1/2 rounded-full"
        />
        <span aria-hidden className="device-key top-[19%] -left-0.5 h-7" />
        <span aria-hidden className="device-key top-[28%] -left-0.5 h-7" />
        <span aria-hidden className="device-key top-[23%] -right-0.5 h-11" />

        {/*
          The screen. `isolate` makes it the stacking context the poster and
          its scrim sit at the back of (`-z-10`), so the copy can stay in
          normal flow above them. That matters because the title's link
          stretches over the whole screen with an `::after`, and an absolutely
          positioned copy block would become that pseudo-element's containing
          block and shrink the target to the text.
        */}
        <div className="group bg-forest text-paper relative isolate flex aspect-[9/17.4] w-[min(72vw,300px)] flex-col justify-end overflow-hidden rounded-[calc(var(--radius-device)-0.25rem)] lg:w-65 xl:w-75">
          <Image
            src={listing.poster.url}
            alt={listing.poster.alt}
            fill
            quality={75}
            sizes="(min-width: 1280px) 300px, (min-width: 1024px) 260px, (min-width: 417px) 300px, 72vw"
            className="ease-cinematic -z-10 object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />

          {/*
            The scrim is sized for the brightest frame a poster can be, not
            the average one: the copy sits on at least 80% forest from just
            above its first line, which keeps paper type above 7:1 over pure
            white and the 85% lines above 5.5:1.
          */}
          <div
            aria-hidden
            className="via-forest/80 to-forest absolute inset-0 -z-10 bg-linear-to-b from-transparent from-30% via-58%"
          />

          {/* The app's top bar, as on the tour: the mark over a short scrim. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 flex h-11 items-center justify-center"
          >
            <span className="from-forest/85 absolute inset-0 bg-linear-to-b to-transparent" />
            <Wordmark tone="onDark" className="relative h-6" />
          </div>

          <div className="px-4 pb-4">
            {kind ? <p className="text-paper/85 text-xs">{kind}</p> : null}

            <p className="font-display tracking-display mt-1 text-xl leading-tight text-balance">
              {/* An <a>, not a Link: it leaves this origin for the app. */}
              <a
                href={appListingHref(listing.slug, "listing")}
                className="focus-visible:after:ring-terra-soft after:absolute after:inset-0 after:z-10 after:rounded-[calc(var(--radius-device)-0.25rem)] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset"
              >
                {listing.title}
                <span className="sr-only">, in the Yuvoy app</span>
              </a>
            </p>

            <p className="text-paper/85 mt-2 flex min-w-0 items-center gap-2 text-xs">
              <span className="truncate">{listing.operator.name}</span>
              {/* Only on the API's word: `verified` means every mandatory
                  credential is on file, checked and in date. */}
              {listing.operator.verified ? (
                <span className="text-paper inline-flex flex-none items-center gap-1 font-medium">
                  <CheckGlyph className="size-3.5" />
                  Verified
                </span>
              ) : null}
            </p>

            {listing.price ? (
              <p className="mt-3 leading-none">
                <span className="text-lg font-bold">
                  {formatMoney(listing.price)}
                </span>
                {/* The API's phrase, verbatim: it knows a charter is "for the
                    group" and this file does not. */}
                {listing.priceUnit ? (
                  <span className="text-paper/85 ml-1 text-xs">
                    {listing.priceUnit}
                  </span>
                ) : null}
              </p>
            ) : null}

            {/*
              What the stretched link does, drawn as the site's own button.
              A row of its own: beside the price it ran past a 260px screen.
              Hidden from assistive tech, which already has the link's name,
              and inert, because the link's overlay is what takes the tap.
            */}
            <span
              aria-hidden
              className={cn(
                buttonVariants({ variant: "paper", size: "sm" }),
                "pointer-events-none mt-4 flex w-full",
              )}
            >
              Open in the app
              <ButtonArrow />
            </span>
          </div>
        </div>
      </div>

      {/* The caption the tour's "Sample preview" was, now saying the
          opposite. Keep it narrower than the screen: on a `w-fit` wrapper a
          wider caption sizes the frame's column (DESIGN_SYSTEM §8). */}
      <p className="label text-forest/75 mt-3.5 text-center text-[10px]">
        A real listing on Yuvoy
      </p>
    </div>
  );
}

/**
 * No listing to show: the API could not be read when the page was rendered,
 * or nothing is listed. Said plainly, with the way there, rather than with
 * an empty phone.
 */
function NoListing() {
  return (
    <div className="rounded-edge border-paper-line bg-paper-deep flex w-full max-w-sm flex-col items-start gap-4 border p-6 lg:max-w-xs lg:flex-none">
      <p className="label text-terra-deep">In the Yuvoy app</p>
      <p className="text-forest/75 leading-relaxed">
        What operators are running now, with prices and dates, is in the Yuvoy
        app.
      </p>
      <a
        href={appHref("listing")}
        className={cn(
          buttonVariants(),
          "mt-2 flex w-full sm:inline-flex sm:w-auto",
        )}
      >
        Browse experiences
        <ButtonArrow />
      </a>
    </div>
  );
}

/**
 * The three moves the section's lede promises, as the tour's rail named them.
 *
 * Static now: they were buttons that sought the tour to each act, and with no
 * tour there is nothing to seek. Below `sm` they are a row of three titles and
 * the sentences are left to assistive tech; the lede above already says the
 * same thing in one line, and three wrapped sentences in three narrow columns
 * cost a phone more height than they give back.
 */
const STEPS = [
  { id: "watch", title: "Watch", body: "Real videos of the experience." },
  {
    id: "understand",
    title: "Understand",
    body: "Clear details you can trust.",
  },
  {
    id: "book",
    title: "Book",
    // Was "Pick a time, pay, done." Payment is at the counter on the day,
    // which is what the app says at checkout.
    body: "Pick a day, and pay at the counter on the day.",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function Steps() {
  return (
    <ol
      aria-label="How it works"
      className="flex w-full max-w-sm gap-2 lg:block lg:max-w-xs lg:min-w-0 lg:flex-1"
    >
      {STEPS.map((step) => (
        <li
          key={step.id}
          className="flex min-w-0 flex-1 flex-col items-center gap-2 py-1 text-center lg:flex-row lg:items-start lg:gap-4 lg:py-3.5 lg:text-left"
        >
          <span
            aria-hidden
            className="rounded-edge border-paper-line bg-paper-deep text-forest flex size-10 flex-none items-center justify-center border"
          >
            <StepGlyph id={step.id} />
          </span>
          <span className="min-w-0 flex-1 lg:w-full">
            <span className="font-display tracking-display text-forest block text-base leading-snug sm:text-lg lg:text-xl">
              {step.title}
            </span>
            <span className="text-forest/70 sr-only text-sm leading-relaxed sm:not-sr-only sm:mt-0.5 sm:block">
              {step.body}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------- glyphs -- */

function StepGlyph({ id }: { id: StepId }) {
  if (id === "watch") {
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" className="size-4">
        <path d="M5.2 3.2v9.6L13 8 5.2 3.2z" />
      </svg>
    );
  }
  if (id === "understand") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="size-4.5">
        <circle
          cx="10"
          cy="10"
          r="7.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 9.25V13.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="6.4" r="0.9" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4.5">
      <rect
        x="3"
        y="4.5"
        width="14"
        height="12"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M3 8.25h14" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 2.75v3M13 2.75v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.4 12.4l1.8 1.7 3.4-3.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M4 10.5l4 4 8-8.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
