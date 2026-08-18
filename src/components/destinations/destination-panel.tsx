import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  destinationHref,
  type DestinationContent,
} from "@/lib/site/destinations";

/**
 * A destination, as an editorial plate.
 *
 * ## Why this is not a card
 *
 * A card is a box with a picture in a slot, a body and a button. This is one
 * photograph, edge to edge, with the type set *on* it and a single target:
 * the whole plate is the link, so there is one thing to hit rather than a
 * heading and a "read more" pointing at the same page. That is what the
 * triptych is for — three plates read as one composition, and three cards
 * read as a pricing table.
 *
 * ## The caption is always dark, and it is always on the photograph
 *
 * The image fills the plate — behind the caption too — and the caption is a
 * `forest` block the photograph dissolves into. One treatment on both tones.
 *
 * It was not always. Until 2026-08-14 the caption **inverted** its section: a
 * forest caption on a cream page, a cream caption on a forest one. That rule
 * existed for a real failure — when the first-launch act went dark on
 * 2026-08-07 the forest captions matched the forest section and three
 * photographs bled into the background (owner report) — and inverting was the
 * unmissable fix. It also cost the composition the thing the plate is for:
 * a cream slab under each image turned the triptych back into three cards.
 *
 * A hairline was rejected then as "a one-pixel promise against a photograph
 * fading to the same green", and on a flat forest section it was. What
 * changed is that the section is no longer flat: `FirstLaunch` now carries
 * artwork, so the plate's edge is a crisp 1px line and a flat caption block
 * against a field with light and grain moving through it. Two signals, not
 * one, and the darker one no longer has to be the page.
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
 * failure the accessibility gate bans, so the caption keeps its own solid
 * block and the gradient only softens the join above it.
 */
export function DestinationPanel({
  destination,
  /**
   * The surface the plate sits on. It decides the focus ring's offset colour
   * and how hard the no-photograph fallback has to work for its edges; the
   * caption is the same on both.
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
        "group bg-forest text-cream rounded-edge relative block aspect-square overflow-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:aspect-3/4",
        // The plate's own edge, and the reason the caption no longer has to
        // invert. It is drawn on the Link rather than as an overlay so it
        // cannot be painted over: `Image fill` resolves `inset-0` against the
        // padding box, which starts inside this border.
        //
        // `cream/15` on both tones. It is the object's edge, not the
        // surface's, so it does not follow the section — and it disappears
        // exactly where it is not needed, along the bright top of a
        // photograph, while holding the line across the dark caption where
        // the plate would otherwise meet a forest section with nothing
        // between them.
        "border-cream/15 border",
        // The ring and its offset both follow the surface. A cream offset on
        // a forest section draws a pale gap around the plate, which reads as
        // a rendering fault rather than as focus.
        onInk
          ? "focus-visible:ring-terra-soft focus-visible:ring-offset-forest"
          : "focus-visible:ring-terra-deep focus-visible:ring-offset-cream",
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
          the diagonal lift gives it the depth the image version gets from
          the picture.

          The outer edge that used to be drawn here on a dark section is gone
          — the Link carries it on both tones now. Definition still comes from
          a cream at low opacity rather than from a new surface: there is one
          dark (§1), and a plate with no photograph may not invent a second.
        */
        <div aria-hidden className="absolute inset-0">
          <div className="from-cream/12 absolute inset-0 bg-linear-to-br to-transparent" />
          <div className="border-cream/12 absolute inset-4 border sm:inset-5" />
        </div>
      )}

      {/*
        The caption, pinned to the foot of a fixed 3:4 plate.

        ## The height is the plate's, not the caption's

        `sm:aspect-3/4` fixes the plate at the height it has always had (330x440
        at the measure, 327x436 on a phone) and the photograph fills all of
        it. The caption is `absolute bottom-0`, so its height constrains
        nothing: it takes what its content needs and grows UPWARD over the
        image if a long name, a browser minimum font size or a user's zoom
        asks for more. Nothing can clip it, and nothing it does moves the
        plate — which is what lets the height be fixed at all. The version
        with a fixed ratio and the caption in flow could clip; the version
        that let the caption push the plate grew it to 522px.

        ## The shade

        No solid block any more (owner report, 2026-08-18: "too heavy"). The
        ground is a continuous curve — `plate-shade` for ~190px above,
        `plate-caption` across the type — meeting at one value with no seam,
        and the photograph stays legible through the whole upper half of it:
        about 32% of the picture still shows under the name.

        That is as open as it can be. The measurement and the reason the
        caption's order is load-bearing are on `plate-shade` in globals.css;
        the short version is that the terracotta link is the tightest pairing
        in the palette and it sits at the foot on purpose, where the shade is
        deepest.

        ## This supersedes the solid-caption ruling of 2026-08-09

        That ruling said, in this file: "The caption stays SOLID and never
        becomes an overlay, at any width", and it was right on the evidence it
        had. A gradient caption HAD shipped once and failed — Neil's near-white
        sand put a secondary line at about 3.2:1, and axe reports text over a
        gradient as "incomplete" rather than as a violation, so nothing caught
        it. Solid was the only version anyone had measured.

        It is reversed on owner direction (2026-08-18) and on a measurement
        rather than on taste. The reason a gradient can be safe now is that the
        caption's elements are stacked in the order of how much contrast each
        needs and the gradient deepens in the same direction, so each one is
        checked where it actually sits — swept over three title sizes, two to
        four description lines and both leading values, against the brightest
        pixel under any of the three shipped plates. Worst figure: 4.80:1.
        The full table is on `plate-shade`.

        **What the 2026-08-09 pass got right is kept**: the phone runs one step
        tighter than the measure at every gap, and the plate stays squarer than
        3:4 below `sm` so three of them do not add a screen of scrolling
        (owner report: mobile scrolls too far).
      */}
      <div className="plate-caption text-cream absolute inset-x-0 bottom-0 p-4 sm:p-5">
        {heroMedia && (
          <span
            aria-hidden
            className="plate-shade pointer-events-none absolute inset-x-0 bottom-full h-40 sm:h-48"
          />
        )}
        <h3 className="font-display tracking-display text-2xl leading-none font-normal sm:text-3xl">
          {destination.name}
        </h3>
        {/*
          Never truncated (owner direction, 2026-08-18): the sentence is the
          only thing on the plate that is not repeated in the section around
          it, so a clamp here loses the one piece of information the plate
          adds. `min-h` keeps the floor at two lines so a short description
          cannot make one caption shallower than its neighbours, and there is
          no ceiling — the three shipped sentences run 65 to 73 characters and
          wrap to the same count at every breakpoint, so the row stays level,
          and a longer one would simply grow its caption upward.

          `cream/85`, not the usual `cream/70`: this sits on a gradient rather
          than on flat forest, and the ladder in §1 is measured against flat
          forest. The rung is set by the measurement on `plate-shade`.
        */}
        <p className="text-cream/85 mt-3 min-h-9.5 text-sm leading-snug sm:mt-3.5">
          {destination.shortDescription}
        </p>
        {/* Not a link: the plate already is one. This is the affordance that
            says so, and its arrow eases forward on hover the way the rest of
            the site's forward actions do.

            **This must stay the last element in the caption.** `terra-soft`
            is the tightest pairing in the palette (5.36:1 even on flat
            forest), and it clears AA here only because it sits at the foot
            where `plate-caption` has closed to 94.5%. Moving it above the
            description puts it on a lighter ground and it fails. */}
        <span className="label text-terra-soft mt-4 inline-flex items-center gap-2 sm:mt-5">
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
 * columns — it is one column or three, and the jump happens at `md`.
 *
 * `md` is the tightest the row gets: three columns of a 688px measure are
 * ~216px each, against a caption block that is a near-constant ~220px tall.
 * The plate reads tall and narrow there, and that is the right failure —
 * before 2026-08-14 the plate held a fixed ratio instead, so the same squeeze
 * came out of the photograph, which had 66px left by that breakpoint. The
 * plate grows now; nothing is crowded out of it.
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
