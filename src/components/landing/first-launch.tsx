import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/section";
import { DestinationGrid } from "@/components/destinations/destination-panel";
import { DESTINATIONS } from "@/lib/site/destinations";
import { EXPANSION_STATUS } from "@/lib/site/launch";

/**
 * Where Yuvoy opens, as a triptych on a night field.
 *
 * This is the act that has to do two contradictory things at once: make the
 * Andamans feel like the whole point, and make clear they are the first
 * destination rather than the shape of the product. The headline does the
 * first; the status line under it does the second, in one line, without the
 * defensive framing the old strategy act used to carry ("a second market is a
 * decision, not a date" — retired 2026-08-07, it made a plan sound like an
 * excuse).
 *
 * The three plates come from `DESTINATIONS`. **Nothing about this section
 * knows there are three of them, or that they are islands** — a second market
 * is an entry in that file, and this section renders whatever it is given.
 *
 * ## Why this act is dark (owner direction, 2026-08-07)
 *
 * It swapped surfaces with the operator act, and the page is better for it:
 * forest → paper → forest → paper → forest → paper → forest, alternating the
 * whole way down instead of running two paper acts and then three dark ones.
 *
 * ## Why it carries artwork (owner direction, 2026-08-14)
 *
 * A flat forest field left the plates nothing to sit against. The fix at the
 * time was to invert each caption — a paper slab under every photograph —
 * which gave the plates their edges back and turned the triptych into three
 * cards doing it. The artwork solves the same problem the other way: the
 * section becomes a place with light and depth in it, and a flat plate with a
 * hairline reads as an object resting on that place. The captions went back
 * to forest in the same change, and the photographs now dissolve into them.
 *
 * The field is four inert layers over the forest ground, the same
 * construction as the cover and the footer: the delivered artwork, the
 * `plate-wash` that seats it in the brand green, the `launch-field` vignette,
 * and grain so every layer sits in one film. All four are light, because the
 * contrast ceiling is compressed into the asset at build time rather than
 * painted over it here — the version that painted it over ran for a day and
 * left the artwork invisible.
 *
 * It does not drift. The cover's artwork does, because it is the arrival; a
 * second breathing field one scroll down would be the page moving on its own
 * rather than a moment that moves.
 */
export function FirstLaunch() {
  return (
    <Section
      tone="ink"
      id="destinations"
      aria-labelledby="first-launch-heading"
      backdrop={
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          {/*
            The artwork is laid in at its OWN ratio, anchored to the crown of
            the section — it is not stretched to whatever height the section
            turns out to be.

            That was the bug (owner report, 2026-08-18: "zoomed in", and the
            left of the frame gone). `object-cover` across the whole section
            has to fill a box whose height is set by the copy and three
            plates: ~1.4:1 on a laptop against the artwork's 16:9, so it
            scaled to the height and took the width off both edges — the palms
            on the left first. On a phone the section is roughly 0.3:1, which
            is a **six-fold** enlargement of a 1672px-wide frame. Nothing was
            wrong with the file; it was being asked to be a shape it is not.

            `aspect-16/9` on this layer means the band is always the frame's
            own shape, so from `sm` up there is no horizontal crop at all and
            the whole width — palms, shafts, the boat, the island — is on the
            page. Below `sm` a bare 16:9 band would be a 211px strip, so
            `min-h-90` (360px) holds it open; 360px is exactly what 16:9 gives
            at the `sm` breakpoint itself, so the floor and the ratio meet
            without a step at 640px. `object-left` decides what the phone's
            remaining crop keeps: the left of the frame, which is where the
            palms and the light are.

            Where the band ends inside the section, `launch-hem` returns it to
            solid forest, so the field dies out rather than stopping.
          */}
          <div className="absolute inset-x-0 top-0 aspect-16/9 min-h-90 sm:min-h-0">
            <Image
              src="/photography/first-launch.webp"
              alt=""
              fill
              sizes="100vw"
              /*
                Served straight from `public/`, not through the optimiser.

                This file is already final: `optimise-photography.mjs` sizes it
                to the artwork's own 1672px, compresses its highlights and
                encodes it to a 20KB WebP. Re-deriving variants from that at
                request time saves a few kilobytes and costs a cold decode on
                every width — and the homepage already runs the cover, the
                footer and three plates through the optimiser.

                That cost is measurable rather than theoretical. Adding this
                image tipped `/` past `networkidle` under a full parallel e2e
                run: three analytics specs timed out at 30s, all of them
                waiting on the network to settle, and all of them passing when
                the spec ran alone. It is the same failure the cover's artwork
                hit in 2026-08-06, which is why that PNG became a WebP.

                A decorative backdrop that is already 20KB has nothing left for
                the optimiser to win.
              */
              unoptimized
              /*
                Neither `priority` nor eager: this act is a full screen below
                the cover on every viewport, so preloading it would compete
                with the artwork that owns the Largest Contentful Paint. The
                forest ground underneath is already the section's colour, so
                nothing flashes while it arrives.
              */
              className="object-cover object-left"
            />
            {/* Seats the artwork in the brand field, at the same 14% the
                plates use. It is a wash and nothing more: the contrast
                ceiling is compressed into the asset at build time
                (`compressHighlights` in optimise-photography.mjs), which is
                what lets every layer here stay this light. A 70% multiply
                lived here for a day and emptied the artwork out. */}
            <div className="plate-wash absolute inset-0" />
            <div className="launch-hem absolute inset-x-0 bottom-0 h-2/5" />
          </div>
          <div className="launch-field absolute inset-0" />
          <div className="grain" />
        </div>
      }
    >
      <SectionHeading
        id="first-launch-heading"
        tone="ink"
        eyebrow="First launch"
        title="Opening in the"
        accent="Andaman Islands."
        body="We are starting with Havelock, Neil and Port Blair while onboarding more destinations for what comes next."
      />

      {/* The status line, once. Set as a quiet rule-and-label rather than a
          panel: it is context for the headline above it, not a notice. The
          rule fades out before the right margin (`launch-rule`) — a full-width
          hairline over artwork reads as a crop mark.

          The step down on a phone (`mt-8`/`pt-4` against `sm:mt-10`/`sm:pt-5`)
          is dev's mobile-scroll pass of 2026-08-09 and is kept as it was: the
          rule replaced a `border-t`, not the rhythm around it. */}
      <div className="mt-8 sm:mt-10">
        <span aria-hidden className="launch-rule block h-px w-full" />
        <p className="label text-paper/70 mt-4 sm:mt-5">{EXPANSION_STATUS}</p>
      </div>

      <DestinationGrid
        destinations={DESTINATIONS}
        tone="ink"
        className="mt-8 sm:mt-14"
      />
    </Section>
  );
}
