# Yuvoy Design System

Single source of truth for visual design. **Every color, font, radius and tracking value used in the app must map to a token here.** Never invent a value that falls between tokens — add a token (with review) instead.

Direction: **editorial, rectangular, confident.** Heavy geometric display type against wide-tracked mono labels; cream editorial surfaces alternating with forest immersive ones; hairline rules doing the work that boxes and shadows do elsewhere. Generous space, fast interactions, slow entrances.

> **Brand Kit v2** (ratified 2026-08-01) supersedes v1. v1 was Fraunces + pill geometry on a warmer cream; v2 moves to Poppins + IBM Plex Mono and a rectangular geometry, retuning the palette to match. Rationale and the full contrast table are in §1.
>
> **v2.1 (2026-08-03)** replaces the two darks, `teal` `#0D3B3E` and `ink` `#22302E`, with a single `forest` `#16362E`. Nothing else changed.
>
> **v2.2 (2026-08-03, owner-directed)** replaces the display face: Poppins → **Instrument Serif**, the editorial serif the narrative-landing rebuild is set in. Owner brief: anything but the palette may change in service of a more premium register. The serif ships one weight (400 + italic), so display type is `font-normal` always — mass comes from size and leading, and there is no faux-bold to reach for. The wordmark deliberately stays on the sans (Inter semibold) so the mark reads engineered against the serif's warmth. Palette untouched. Adds `--radius-device` (§4) and the preview-surface rule (§8).

## 0. Architecture rule

- Styling system: **Tailwind v4** utilities + **CVA** for component variants. Tokens are CSS custom properties in `src/app/globals.css` under `@theme`.
- Compose from `src/components/ui` primitives; do not re-implement.
- Class merging via `cn()` (`src/lib/cn.ts`).

## 1. Color tokens

Brand Kit v2. Every ratio below is measured (sRGB relative luminance, WCAG 2.2) — not estimated.

| Token        | Hex       | Role                                                      |
| ------------ | --------- | --------------------------------------------------------- |
| `cream`      | `#F4EFE4` | Canvas — default page background                          |
| `cream-deep` | `#ECE5D6` | Raised surfaces — cards, inputs, panels on cream          |
| `cream-line` | `#E5DCC9` | Hairline borders on cream                                 |
| `forest`     | `#16362E` | Primary ink **and** every dark surface (11.44:1 on cream) |
| `terra`      | `#BE7149` | Accent — decoration and LARGE display text only (3.24:1)  |
| `terra-deep` | `#985028` | Text-capable accent + primary CTA fill (5.21:1 on cream)  |
| `terra-soft` | `#D89772` | Accent text on forest (5.36:1)                            |

### Measured contrast

| Pairing                      | Ratio   | Verdict                     |
| ---------------------------- | ------- | --------------------------- |
| `forest` on `cream`          | 11.44:1 | AA + AAA body               |
| `terra-deep` on `cream`      | 5.21:1  | AA body                     |
| `terra-deep` on `cream-deep` | 4.77:1  | AA body                     |
| `terra` on `cream`           | 3.24:1  | **large text only** (≥24px) |
| `cream` on `terra-deep`      | 5.21:1  | AA body — the primary CTA   |
| `cream` on `forest`          | 11.44:1 | AA + AAA body               |
| `terra-soft` on `forest`     | 5.36:1  | AA body                     |

### There is one dark surface

**`forest` is the only dark background on the site** — sections, the
registration block, and the footer alike. It is also the colour of all body
text on cream. `Section`'s `tone` is `"cream" | "ink"`, and `ink` paints
`forest`; there is no second dark to choose between.

There used to be. `teal` (`#0D3B3E`) and `ink` (`#22302E`) differed in hue —
184° against 171° — and in saturation — 65% against 17% — so one read as a
cyan and the other as a grey. Nobody scrolling a page tracks which block is
structural; they see two dark fields in two colours and conclude one of them
was a mistake. It was reported as a bug three times before it was fixed as one.

`#16362E` is a forest green with a teal undertone (hue 165°, saturation 42%,
lightness 15%). Two things made it the pick over the lighter `#1B4138` that was
also on the table: it holds **five times the contrast headroom** on the
tightest pairing (terracotta accent on dark clears the 4.5 floor by 0.86 rather
than 0.12, so a later tweak to the accent cannot silently break it), and at 15%
lightness it matches the depth of the darks it replaced, so the change reads as
_the greens became one_ rather than _the site got lighter_.

### The terra rule (read before using an accent on text)

`terra` is **decoration and large display text only**. At 3.24:1 it clears AA
for large text (≥24px, or ≥18.66px bold) and nothing else. It may never be used
for body copy, labels, nav, or button text.

- Accent text at body/label size **on cream** → `terra-deep`.
- Accent text **on forest** → `terra-soft`.
- Accent **fills** (the primary CTA) → `bg-terra-deep text-cream`. A `terra`
  fill with any text on it fails AA; this is why the CTA is the deeper tone.

### The opacity ladder (measured, not guessed)

Muted and secondary text comes from **opacity modifiers on `forest` / `cream`**, not new tokens. The rendered composite decides whether it passes, so the safe floors are fixed:

| Usage                         | Floor            | Composite ratio |
| ----------------------------- | ---------------- | --------------- |
| Body/secondary text on cream  | `text-forest/70` | 4.77:1          |
| Labels + small text on cream  | `text-forest/75` | 5.55:1          |
| Body text on forest           | `text-cream/60`  | 5.15:1          |
| Comfortable secondary on dark | `text-cream/70`  | 6.45:1          |

**Anything below `forest/70` on cream, or `cream/60` on dark, is decoration only** — never text. Every rung above held when the darks merged: `forest` is deeper than the `teal` it replaced, so each pairing gained margin rather than losing it.

Borders and fills are exempt from these floors — `border-forest/20`, `bg-forest/5`, `border-cream/12` are all fine.

## 2. Typography

- **Display — Instrument Serif** (`font-display`), single weight 400 + italic. Headlines are set large, light and tight (`font-normal tracking-tight`, leading ≈1.0) — the serif carries mass through **size**, never weight. `font-bold`/`font-extrabold` must never appear with `font-display`: the face has no bold, and the browser would synthesise an ugly one. **Italic is reserved for the terracotta "turn"** — the second thought of a headline — which stays the brand's most recognisable typographic move. Do not use italic display type for anything else.
- **UI / body — Inter** (`font-sans`, the default). Bold weights live here.
- **Label — IBM Plex Mono** (`font-mono`) via the `label` utility: uppercase, `text-xs`, `font-medium`, `tracking-label` (0.18em). Eyebrows, nav, stats, metadata, button labels. The engineered counterweight to the serif's warmth.
- **`eyebrow` utility** — the `label` preceded by a short terracotta rule (a 1.75rem hairline). This is the section-opening gesture; **use it once per section**, at the top. On the homepage the eyebrow also carries the act number (`01 — The real problem`), making the page's narrative structure visible.
- **Wordmark** — `tracking-wordmark` (0.34em) on **sans** semibold caps (v2.2): the serif is the site's voice, the sans mark is the object that signs it. See `<Wordmark />`, which also carries the official mark and the "Experience more." kicker.
- **The mark** — the official ensō (white brush ring + terracotta dot), always on its **forest tile**. The delivered source (`public/yuvoy-logo.png`) has an opaque black field, so the committed display assets are derived by `scripts/generate-brand-assets.py` (screen-blend onto forest, glow soft-knee, auto-crop): `public/brand/yuvoy-mark.png` (UI + OG), `src/app/icon.png` and `src/app/favicon.ico`. Re-run the script if the source logo is ever replaced; never hand-edit the derived files.

Scale: Tailwind's type scale. Headlines `font-display`; everything else inherits Inter unless it is a label.

## 3. Motion

Two budgets, and they are not the same thing — this is the ruling that resolves "fast, responsive UI" against "slow, considered entrances".

| Class of motion                                                                 | Budget     | Easing               |
| ------------------------------------------------------------------------------- | ---------- | -------------------- |
| **Interaction feedback** — menu open/close, hover, tab switch, accordion, focus | **≤250ms** | `--ease-interaction` |
| **Entrance** — scroll reveals, the `rise` utility, `<Reveal>`                   | ~700ms     | `--ease-cinematic`   |

- Tokens: `--ease-interaction` (`cubic-bezier(0.32,0.72,0,1)`), `--ease-cinematic` (`cubic-bezier(0.22,1,0.36,0.16)`).
- CSS entrance: the `rise` utility (opacity + translateY, 700ms). Prefer this above the fold — it ships zero JS.
- JS motion: **Motion** (`motion/react`) via `<Reveal>`. All motion is wrapped in `<MotionConfig reducedMotion="user">` (providers) — **never bypass it**.
- **Reduced motion is handled globally**, once, in `globals.css`: a `prefers-reduced-motion: reduce` block neutralises every animation and transition. Individual components must not add their own reduced-motion branch — if a component needs one, the global rule is wrong and should be fixed instead.
- Smooth scroll: **not implemented, and out of scope.** Lenis was removed in v2 rather than left as a dependency implying a feature that did not exist.

## 4. Radius, spacing, sizing, grid

- **Radius: `rounded-edge` (2px) — the editorial near-square.** Buttons, inputs, cards and panels all share it. **Pills are not part of the system** (v1 used them; v2 does not).
- **`--radius-device` (2.25rem) — the one rounded object in the system**: the Season One phone-preview frame. It depicts hardware, not UI; nothing else may use it. (Tiny `rounded-full` dots inside the preview depict hardware/avatars and share this exemption.)
- Spacing: Tailwind v4 dynamic scale (multiples of `0.25rem`). Stay on the scale.
- Control heights: `sm` 36px (`h-9`), `md` 44px (`h-11`), `lg` 52px (`h-13`). Inputs are 48px (`h-12`).
- **Page measure: `container-page`** — `max-w-page` (70rem) with `px-6 sm:px-10` gutters. Every full-width section uses it; prose pages may narrow further (`max-w-2xl`).
- **Editorial grid: `grid-page`** — 4 columns on mobile, 8 from `sm`, 12 from `lg`, with responsive gutters. Place children with `col-span-*` per breakpoint. Use it for content-heavy pages (destinations, journal, comparison layouts); simple stacked sections do not need it.

## 5. Components (current)

- **`Button`** — variants `primary | outline | ink | ghost | outlineOnDark`, sizes `sm | md | lg`. Labels are uppercase mono.
  - **`primary` and `outline` are the first-class pair.** Every screen should use those two; a page with three competing button styles is a bug.
  - `ink` (solid forest), `ghost` (text-only) and `outlineOnDark` (secondary on forest sections) are **situational** — allowed, but justify them in review.
  - Use `buttonVariants()` to style a `<Link>` as a button; `<ButtonArrow />` for the trailing arrow on a forward action.
- **`Input`** — `rounded-edge` field on `cream-deep`, terra-deep focus ring.
- **`Wordmark`** / **`WaveMark`** — the official ensō mark on its forest tile, wordmark, "Experience more." kicker. `tone="onDark"` adds a hairline ring so the tile stays legible on forest surfaces.
- **`SiteHeader`** / **`SiteFooter`** / **`MobileMenu`** — the shell, rendered by the root layout on every route. All navigation comes from the registry (§7).
- Growing set: ExperienceCard, FeedPlayer, AvailabilityPicker, PriceBreakdown (as screens land).

## 6. Accessibility (release gate)

WCAG 2.2 AA, enforced not assumed:

- Contrast pairings come from §1's measured table and the opacity floors. Nothing ships on an unmeasured pairing.
- Keyboard-complete flows; visible focus (`focus-visible:ring-terra-deep`).
- **Tap targets: `tap-target` on any standalone small link.** A 16px `label` link is a 16px pointer target, below the 24px SC 2.5.8 minimum — the utility lifts it to 28px. Links inside a sentence are exempt (the criterion's inline exception) and should not use it. Enforced per route in `e2e/shell.spec.ts`; axe does not catch this.
- `aria-invalid` + `role="alert"` on form errors.
- The mobile menu is a native `<dialog>` opened with `showModal()` — the browser provides the focus trap, Escape handling and background inerting, so they cannot drift out of sync with the markup.
- axe runs in CI against every route.

## 7. Navigation registry

`src/lib/site/nav.ts` is the single source of truth for every navigable route. The header, the mobile menu and the footer are all derived from it.

- **A route is added to the registry in the same PR that ships its page** — never before. This makes a link to a non-existent page structurally impossible.
- Footer columns with no entries are dropped rather than rendered empty.
- `CONTACT_CHANNELS` is empty by design: an unmonitored address is worse than none, so the footer omits the whole row until a real channel is confirmed.

## 8. Figma / prototype → code

No Figma. The reference is the [pre-launch landing artifact](https://claude.ai/public/artifacts/b099d827-a565-4679-91c2-38d242feeed7) plus the brand docs.

**The artifact is a visual reference, not a content one.** Its layout, density, type treatment and motion are the target. Its copy is not: it shows prices, live availability, named listings and completed-booking screens, none of which exist. Those are barred by the project's truthfulness rules (see `CLAUDE.md` and issue #32) and several of its own colour pairings fail AA — the palette in §1 is the corrected version, not a transcription.

### The preview surface (owner-approved exception, 2026-08-03)

The homepage's **Season One phone preview** is the one place illustrative product content may appear — prices, seat counts, operator lines — under three conditions, all enforced:

1. The frame is **visibly labelled** ("Season One preview") and its wrapper carries `data-preview`; the homepage e2e guard bans invented numbers everywhere _outside_ that wrapper.
2. Its "footage" is **moving colour built from brand tokens** (`film-*` + `caustics` utilities, `color-mix` only) — unmistakably an illustration, never a fake photograph or a real-looking screenshot.
3. Claims **outside** the preview stay literally true (e.g. the "3 founding operators signed" count is owner-confirmed and must track reality).

Any pasted export is oversized vs. real scale: calibrate the ratio, snap every value to a token, re-express with flex/grid, mobile-first.
