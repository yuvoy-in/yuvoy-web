import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { LAUNCH_STATUS_LABEL } from "@/lib/site/launch";
import {
  destinationHref,
  type DestinationContent,
} from "@/lib/site/destinations";

/**
 * A destination, as an editorial plate.
 *
 * ## Why this is not a card
 *
 * A card is a box with a border, a rounded corner and a button. This is a
 * full-bleed plate with sharp edges, type set on the image, and a single
 * target: the whole plate is the link, so there is one thing to hit rather
 * than a heading and a "read more" pointing at the same page. That is what the
 * triptych is for — three plates read as one composition, and three cards read
 * as a pricing table.
 *
 * ## The caption always inverts its section
 *
 * A forest caption on a cream page, a cream caption on a forest page. This is
 * the rule that keeps a plate an object rather than a stain: the caption is
 * the only part of the plate that is a flat colour, so if that colour matches
 * the section behind it the plate has no bottom edge and the photograph
 * appears to dissolve into the page.
 *
 * That is exactly what happened when the first-launch act went dark on
 * 2026-08-07 — the plates had a forest caption, the section became forest,
 * and three photographs bled into the background (owner report). Fixing it by
 * drawing a hairline around each plate would have been a one-pixel promise
 * against a photograph fading to the same green. Inverting the caption is
 * unmissable at every point, and both directions are measured pairings from
 * design system §1 rather than new colours.
 *
 * ## Image-ready, not image-dependent
 *
 * `heroMedia` is optional (see `src/lib/site/destinations.ts`). Without it the
 * plate is solid forest with the type doing the work, which is a deliberate
 * composition in the site's own register rather than a grey placeholder box.
 * With it, the same plate becomes the photograph plus a scrim that keeps the
 * type at the measured contrast. **Adding photography is a data change**, and
 * nothing here needs redesigning when it lands.
 *
 * The scrim is not optional when an image is present: `cream` type on an
 * unknown photograph is exactly the "text placed over unreadable imagery"
 * failure the accessibility gate bans, so the gradient runs from transparent
 * to near-solid forest under the text block.
 */
export function DestinationPanel({
  destination,
  /**
   * The surface the plate sits on. Only the no-photograph fallback cares: a
   * forest plate on a forest section has no edges of its own.
   */
  tone = "cream",
  className,
  priority = false,
}: {
  destination: DestinationContent;
  tone?: "cream" | "ink";
  className?: string;
  priority?: boolean;
}) {
  const { heroMedia } = destination;
  const onInk = tone === "ink";

  return (
    <Link
      href={destinationHref(destination)}
      className={cn(
        "group bg-forest text-cream relative flex flex-col justify-end overflow-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        // The ring and its offset both follow the surface. A cream offset on
        // a forest section draws a pale gap around the plate, which reads as
        // a rendering fault rather than as focus.
        onInk
          ? "focus-visible:ring-terra-soft focus-visible:ring-offset-forest"
          : "focus-visible:ring-terra-deep focus-visible:ring-offset-cream",
        // Sharp edges: the plate is a printed panel, not a UI element. The
        // one rounded object in the system is the device frame (§4).
        "aspect-4/3 sm:aspect-3/4",
        className,
      )}
    >
      {heroMedia ? (
        <>
          <Image
            src={heroMedia.src}
            alt={heroMedia.alt}
            fill
            priority={priority}
            quality={75}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="ease-cinematic object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          {/* Seats the photograph in the brand field. Same idea as the
              cover's multiply layer, at a fraction of the strength. */}
          <div aria-hidden className="plate-wash absolute inset-0" />
        </>
      ) : (
        /*
          No photograph yet. A hairline frame inset from the edge turns the
          plate into a printed panel rather than a flat block of colour, and
          the wash gives it the same depth the image version has.

          On a dark section it needs more than that: the plate is forest, the
          section is forest, and an inset hairline alone leaves a rectangle
          that is only visible if you already know it is there. The lift and
          the outer edge give it back its shape without inventing a second
          dark — there is only one (design system §1), so definition here has
          to come from a cream at low opacity rather than from a new surface.
        */
        <div aria-hidden className="absolute inset-0">
          <div
            className={cn(
              "absolute inset-0 bg-linear-to-br to-transparent",
              onInk ? "from-cream/12" : "from-cream/[0.07]",
            )}
          />
          {onInk && <div className="border-cream/15 absolute inset-0 border" />}
          <div className="border-cream/12 absolute inset-4 border sm:inset-5" />
        </div>
      )}

      {/*
        The caption, on its own solid block, inverted against the section (see
        the note at the top of this file). Type sits on a measured pairing
        either way: `forest` on `cream` and `cream` on `forest` are both
        11.44:1, whatever the photograph above happens to be doing.

        The dissolve is only drawn for the forest caption, where it fades the
        photograph into the same colour it is about to meet. A cream caption
        wants the opposite — a crisp edge, the way a printed caption panel
        sits on a plate — and a gradient to forest above it would read as a
        shadow nobody asked for.

        ## The phone rhythm is one step tighter, and that is a photography
        ## decision rather than a spacing one

        The plate is an aspect-ratio box and this caption is a solid block
        pinned to its foot, so on a 342px column the caption was taking 211 of
        the plate's 256 pixels and leaving a 45px strip of photograph — a
        full-bleed photographic plate showing almost no photograph. One step
        off each gap here gives the image back roughly half again as much room
        without making the plate any taller, which the page cannot afford
        (owner report, 2026-08-09: mobile scrolls too far).

        The caption stays SOLID and never becomes an overlay, at any width.
        That is load-bearing rather than stylistic: `cream` on `forest` is
        11.44:1 whatever the photograph underneath is doing, and the gradient
        version of this was a real bug — on Neil's near-white sand the
        secondary line measured about 3.2:1, and axe reports text over a
        gradient as "incomplete" rather than as a violation, so nothing would
        have caught it.
      */}
      <div
        className={cn(
          "relative p-5 sm:p-7",
          onInk ? "bg-cream text-forest" : "bg-forest text-cream",
        )}
      >
        {heroMedia && !onInk && (
          <span
            aria-hidden
            className="plate-dissolve pointer-events-none absolute inset-x-0 bottom-full h-24 sm:h-28"
          />
        )}
        <p
          className={cn("label", onInk ? "text-terra-deep" : "text-terra-soft")}
        >
          {LAUNCH_STATUS_LABEL[destination.launchStatus]}
        </p>
        <h3 className="font-display tracking-display mt-2 text-3xl leading-none font-normal sm:mt-3 sm:text-4xl">
          {destination.name}
        </h3>
        {/*
          Reserved to exactly two lines, and this is what makes the row line
          up. The plates are equal-height boxes and the caption is bottom
          aligned, so a description that wraps to three lines where its
          neighbours take two pushes that card's name and status label higher
          than theirs — the row then reads as misaligned even though every box
          is identical. Fixing the box was never the fix; fixing the block
          inside it is.

          `min-h` sets the floor (2 lines at `text-sm`/`leading-relaxed` is
          2 × 22.75px) and `line-clamp-2` sets the ceiling, so the block is
          exactly two lines whatever the copy does. `max-w-xs` is gone: it was
          narrowing the measure below the plate's own width and causing the
          third line in the first place.
        */}
        <p
          className={cn(
            "mt-3 line-clamp-2 min-h-11.5 text-sm leading-relaxed sm:mt-4",
            onInk ? "text-forest/75" : "text-cream/70",
          )}
        >
          {destination.shortDescription}
        </p>
        {/* Not a link: the plate already is one. This is the affordance that
            says so, and it draws its underline in on hover the way the rest
            of the site's text links do. */}
        <span
          className={cn(
            "label mt-4 inline-flex items-center gap-2 sm:mt-6",
            onInk ? "text-terra-deep" : "text-cream",
          )}
        >
          Explore {destination.name}
          <span
            aria-hidden
            className="ease-interaction transition-transform duration-200 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

/**
 * The triptych: equal plates on one line, stacked on a phone.
 *
 * ## Why there is no stagger, and no two-column step
 *
 * Both were removed on 2026-08-07 (owner report: the cards "are not aligned").
 *
 * The stagger offset the second and third plates by 40px and 20px, which is a
 * magazine device and reads on a screen as a layout that failed to settle.
 * Three plates of the same size on the same baseline is what "aligned" means
 * here, so that is what this does.
 *
 * The bigger fault was the breakpoint ladder: `sm:grid-cols-2` put three
 * plates into two columns, so from 640px to 1024px the row was two plates and
 * an orphan sitting alone at half width. A set of three never goes to two
 * columns — it is one column or three, and the jump happens at `md`, where
 * three 3:4 plates still have room to breathe.
 *
 * Two plates (the related-destinations rail on a destination page) do take two
 * columns, because two into two is a row rather than an orphan.
 *
 * No carousel: a horizontal rail on mobile would need its own controls to stay
 * accessible, and would risk the horizontal overflow the shell spec fails on,
 * to save a scroll gesture people are already making.
 */
export function DestinationGrid({
  destinations,
  tone = "cream",
  className,
}: {
  destinations: DestinationContent[];
  tone?: "cream" | "ink";
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6",
        destinations.length === 2 ? "sm:grid-cols-2" : "md:grid-cols-3",
        className,
      )}
    >
      {destinations.map((destination) => (
        <li key={destination.key} className="flex">
          <DestinationPanel
            destination={destination}
            tone={tone}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}
