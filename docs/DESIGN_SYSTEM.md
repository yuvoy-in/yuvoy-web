# Yuvoy Design System

Single source of truth for visual design. **Every color, font, radius and tracking value used in the app must map to a token here.** Never invent a value that falls between tokens — add a token (with review) instead.

Direction: **editorial, rectangular, confident.** Geometric display type against wide-tracked caps labels; cream editorial surfaces alternating with forest immersive ones; hairline rules doing the work that boxes and shadows do elsewhere. Generous space, fast interactions, slow entrances.

> **Brand Kit v2** (ratified 2026-08-01) supersedes v1. v1 was Fraunces + pill geometry on a warmer cream; v2 moves to Poppins + IBM Plex Mono and a rectangular geometry, retuning the palette to match. Rationale and the full contrast table are in §1.
>
> **v2.1 (2026-08-03)** replaces the two darks, `teal` `#0D3B3E` and `ink` `#22302E`, with a single `forest` `#16362E`. Nothing else changed.
>
> **v2.2 (2026-08-03, owner-directed)** replaces the display face: Poppins → **Instrument Serif**, the editorial serif the narrative-landing rebuild is set in. Owner brief: anything but the palette may change in service of a more premium register. The serif ships one weight (400 + italic), so display type is `font-normal` always — mass comes from size and leading, and there is no faux-bold to reach for. The wordmark deliberately stays on the sans (Inter semibold) so the mark reads engineered against the serif's warmth. Palette untouched. Adds `--radius-device` (§4) and the preview-surface rule (§8).
>
> **v2.3 (2026-08-05, owner-directed, skill-audited)** retires the serif stack entirely: Instrument Serif / Inter / IBM Plex Mono → **Cabinet Grotesk (display) + Satoshi (everything else)**, self-hosted from `src/fonts` via `next/font/local`. Driver: repeated external feedback that the site read as AI-generated, confirmed by the installed design skills — Instrument Serif is a named LLM-favourite face, the serif-over-Inter-with-mono-eyebrows structure is the documented generated-page house style, and headline emphasis by italic style-switch is a listed tell. Display is **medium (500)** with **700 reserved for the turn**; the turn is now **bold + colour in the same family, never italic** (no italic file exists); labels leave the mono for tracked Satoshi caps; buttons pick up `tracking-label`. Five font files total, no Google Fonts dependency. Palette untouched — the skills sanction deep green + bone + warm accent as a premium family.
>
> **v2.4 (2026-08-05, owner-directed)** swaps the display face only: Cabinet Grotesk → **Poppins** (600 + 700), taken from the original landing prototype kept in `claude-artifacts/`. This is the Brand Kit v2 display face returning — v2 shipped Poppins, v2.2 replaced it for a more premium register, v2.3 replaced that with Cabinet Grotesk. The owner asked to try it again on headlines **only**, so the prototype's Inter and IBM Plex Mono do **not** come back: Satoshi still carries body, UI, labels and the wordmark. Display weight moves from `font-medium` (500) to `font-semibold` (600), since those are the two files that ship. Poppins is also Indian Type Foundry, so both families share a foundry. Four font files total.
>
> **v2.5 (2026-08-06, owner-confirmed)** ends the search: display becomes **Fraunces**, the open-license member of the soft-serif family (Canela / Recoleta / GT Super) that premium travel and island-hospitality brands set their identities in — chosen over roughly 350 candidates across seven review rounds. It ships as a **variable font tuned into the site's own cut**: `opsz` 144, `SOFT` 75, `WONK` 0, pinned on the `font-display` utility itself via `--font-display--font-variation-settings`. Display weight is **400** (`font-normal`, owner pick from a six-weight strip); the turn is a **true drawn italic** at `--font-weight-turn` (480) via `italic font-turn` — the signature stops being a synthesized oblique. Display tracking moves to `--tracking-display` (-0.01em). Satoshi unchanged as the text voice. Five files total (two Fraunces variable + three Satoshi); `font-semibold` is banned everywhere again.

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
| `terra-deep` | `#985028` | Text-capable accent (5.21:1 on cream); never a CTA fill   |
| `terra-soft` | `#D89772` | Accent text on forest (5.36:1)                            |

### Measured contrast

| Pairing                      | Ratio   | Verdict                     |
| ---------------------------- | ------- | --------------------------- |
| `forest` on `cream`          | 11.44:1 | AA + AAA body               |
| `terra-deep` on `cream`      | 5.21:1  | AA body                     |
| `terra-deep` on `cream-deep` | 4.77:1  | AA body                     |
| `terra` on `cream`           | 3.24:1  | **large text only** (≥24px) |
| `terra` on `cream-deep`      | 2.96:1  | **fails everything**        |
| `cream` on `terra-deep`      | 5.21:1  | AA body                     |
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
- **`terra` text may only sit on `cream`, never on `cream-deep`.** Its headroom
  over the large-text floor is 0.24, so the raised surface alone spends it:
  3.24:1 becomes 2.96:1 and the same headline that passes on the canvas fails
  on a panel. A section that paints `cream-deep` and then uses `SectionHeading`
  gets a failing accent with no warning, which is exactly what happened to the
  operators section — put the section on `cream` and raise its inner panels to
  `cream-deep` instead, which is how that section is now built.
- Accent **fills** are not a thing any more. CTAs are monochrome (§5): forest
  on cream surfaces, cream on forest ones. A `terra` fill with text on it fails
  AA, and the `terra-deep` fill that used to carry the CTA was retired on
  2026-08-05 as a template tell.

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

- **Display — Fraunces, the Yuvoy cut** (`font-display`; variable, axes pinned by the utility). Headlines are set large and light (`font-normal tracking-display`, leading ≈1.02–1.05) — character comes from the letterforms, never from shouting. `font-medium`/`font-semibold`/`font-bold` must never appear with `font-display`: the display system is exactly two voices — `font-normal` (400) upright, and the turn at `italic font-turn` (480). `font-semibold` is banned everywhere (Satoshi ships no 600). **The italic terracotta turn** — the second thought of a headline, `italic font-turn` + accent colour — is the brand's most recognisable typographic move, and since v2.5 it is a **true drawn italic** (Fraunces ships the file). Italic remains reserved for turns inside display type; body text never slants — Satoshi has no italic file and emphasis there is `font-bold` upright.
- **UI / body — Satoshi** (`font-sans`, the default), weights 400 / 500 / 700. There is no 600, so `font-semibold` must never appear on body text (the browser would synthesise it). Emphasis in running text is `font-bold`.
- **Label — Satoshi** via the `label` utility: uppercase, `text-xs`, `font-medium`, `tracking-label` (0.18em). Eyebrows, nav, stats, metadata, button labels. The mono was retired in v2.3 — it read as terminal, not magazine.
- **`eyebrow` utility** — the `label` preceded by a terracotta dot, the same square `size-1` marker the fact rows use (a hairline rule until 2026-08-05, replaced by owner direction). This is the section-opening gesture; **use it once per section**, at the top. Eyebrows are plain phrases: no act numbering (owner direction 2026-08-03). The one exception is the cover: the hero's opening line is a plain `label` with no marker (owner direction 2026-08-05).
- **Wordmark** — the owner-delivered **horizontal lockup** (2026-08-06): ensō + terra dot, tracked YUVOY caps, handwritten "Experience more." and its underline, one drawing. `<Wordmark />` renders two surface variants generated by `scripts/generate-header-lockup.mjs` (cream/terra-soft on forest; forest/terra-deep on cream — the §1 pairings) and cross-fades them, so the header's colour change never waits on a fetch. Never hand-edit the generated SVGs. `--tracking-wordmark` survives for the veil's place-name line.
- **Punctuation** — rendered copy never uses an em dash. Prefer a period, a colon, a comma or a parenthetical; ranges and pairings use a middot (owner direction 2026-08-03). Code comments are exempt.
- **Launch timing** — never name a month. The hero states it plainly ("Opening soon", owner direction 2026-08-05); deeper copy may describe the season evocatively ("when the water clears", "when the sea turns to glass").
- **The mark** — the official ensō (brush ring + terracotta dot), **cut out, never tiled**. The delivered source (`public/yuvoy-logo.png`) is white strokes on an opaque black field, so every display asset is derived by `scripts/generate-brand-assets.py`; never hand-edit them, and re-run it if the source is replaced.
  - `yuvoy-mark-on-light.png` / `yuvoy-mark-on-dark.png` — transparent cut-outs, forest and cream strokes. **These are what the UI uses.** Two files rather than one recoloured file because a cream ensō is invisible on cream and a forest one is invisible on forest. `WaveMark` renders both and cross-fades on opacity, so the header's colour change never waits on a fetch.
  - `yuvoy-mark.png`, `src/app/icon.png`, `src/app/favicon.ico` — the forest-tiled version, used only where an icon needs a body: favicon, app icon, OG card. **A tile must never appear in the page itself**; on a forest section it draws a green box around the mark.
  - The script resamples by **area averaging, not bilinear**. Bilinear is a magnifying filter; shrinking with it discards most of the source pixels and is what made the mark look coarse and its brush strokes break up. Masks are measured off the source, not guessed.
  - **Vector assets** are derived from the delivered master `public/yuvoy-logo-vector.svg` by `scripts/generate-vector-brand.mjs`: `public/brand/yuvoy-mark-vector-{cream,forest}.svg`, `public/brand/yuvoy-lockup-vector-{cream,forest}.svg`, and the intro's per-letter module `src/components/brand/yuvoy-letter-paths.ts`. The tagline is stripped from all of them, and the delivered colours are re-expressed as tokens (cream or forest strokes, `terra` dot). Never hand-edit the outputs; re-run the script.

Scale: Tailwind's type scale. Headlines `font-display`; everything else inherits Satoshi unless it is a label.

## 3. Motion

Two budgets, and they are not the same thing — this is the ruling that resolves "fast, responsive UI" against "slow, considered entrances".

| Class of motion                                                                 | Budget     | Easing               |
| ------------------------------------------------------------------------------- | ---------- | -------------------- |
| **Interaction feedback** — menu open/close, hover, tab switch, accordion, focus | **≤250ms** | `--ease-interaction` |
| **Entrance** — the `emerge` utility, on first paint only                        | ~1100ms    | `--ease-cinematic`   |

- Tokens: `--ease-interaction` (`cubic-bezier(0.32,0.72,0,1)`), `--ease-cinematic` (`cubic-bezier(0.22,1,0.36,1)`). The cinematic curve's second control point was `0.16` until 2026-08-04, which made every entrance climb to full, sag back and climb again — a wobble halfway through the motion. If an entrance ever looks unsettled, check this number first.
- CSS entrance: the `emerge` utility, used **only** for the homepage cover's first paint. It moves three properties at once — scale (toward the viewer), translate (settling) and blur (pulling into focus) — so the composition surfaces from depth rather than sliding up, and the blur clears at 65% so the type is sharp while it is still settling. It ships zero JS.
- **The site menu opens like a shutter**: `menu-shutter` unrolls the panel from its top edge with `clip-path` (420ms, cinematic) and rolls it back up to close (320ms, quicker — waiting on a dismissal you already asked for reads as lag). `SiteMenu` holds the dialog open until the closing shutter has run, and skips that wait under reduced motion, where there is nothing to wait for.
- **The brand veil (`BrandIntro`) is the site's entrance**, and the one composition allowed above the `emerge` budget: once per tab session, a night-water scene (film-gradient field, the comp's island horizon at the foot, particle swells rolling in from each edge and dying before the centre, grain) on which the mark surfaces, the wordmark's letterforms arrive in the cover's own emerge grammar, "Experience more." is written on in the veil-only handwriting face (`--font-script`, the one sanctioned use), a sloped calligraphic swash underlines it as the word finishes, and the island's name signs the foot of the frame (~3.4s all told, timeline in `globals.css`). The exit is the emerge grammar reversed — the camera pushes through the dissolving veil — and it hands off: the cover's `emerge` entrance is suspended (`animation: none`, fail-open visible) while the veil holds `data-intro-wait`, then re-applies from zero at exit start, so the hero surfaces through the dissolve. Page scroll is locked by the component only while it plays, never by pre-hydration code, so a hydration failure cannot strand a locked page. It is theatre over a live page, never a loading gate: the page renders and settles behind it, CSS alone runs and ends it, an inline script decides **before first paint** that repeat sessions, reduced motion and no-JS visitors never see it, and any keypress dismisses it on the interaction budget. It must never be given work to do — no data fetching, no font waiting, no route gating — and its session key is `yuvoy.intro-played`.
- **The header wears the cover's colours at the very top** of a route whose first section is dark (`data-dark-hero`, currently `/` and `/go/*`): transparent bar, cream contents. Any scroll away from the top returns the solid bar (owner's choice, 2026-08-04, over tracking the whole cover). The swap is invisible in practice because it happens while the header is hidden — the only cross-fade seen is the deliberate one at the top edge. The cover carries `-mt-14` so it reaches up behind the bar; without that, "transparent" would show the page background rather than the cover.
- **The header is the one exception to the no-scroll-motion rule** (owner direction, 2026-08-04): it slides out of the way going down the page and returns going up, via the `header-slide` utility and `HeaderShell`. It answers a gesture rather than decorating an arrival, which is why it sits in the interaction budget (250ms) and not the entrance one. It never hides near the top, always returns on focus, and does not run at all under reduced motion.
- **No other scroll-triggered motion.** Sections render in place, fully visible, the moment they are reached. The `<Reveal>` component and the operator grid's draw-on-scroll strike were both removed on owner direction (2026-08-03): content that animates itself into view reads as decoration, and on a pitch page it delays the thing the reader came for. Do not reintroduce either without that decision being revisited.
- JS motion: **none.** `motion/react` has no consumers, and `<MotionConfig>` was removed with its last one. If a genuine need for JS animation returns, restore `<MotionConfig reducedMotion="user">` in `providers.tsx` in the same change — it is what makes Motion honour the OS preference, which CSS-level reduced-motion cannot do for it.
- **Reduced motion is handled globally**, once, in `globals.css`: a `prefers-reduced-motion: reduce` block neutralises every animation and transition. Individual components must not add their own reduced-motion branch — if a component needs one, the global rule is wrong and should be fixed instead.
- Smooth scroll: **not implemented, and out of scope.** Lenis was removed in v2 rather than left as a dependency implying a feature that did not exist.

## 4. Radius, spacing, sizing, grid

- **Radius: `rounded-edge` (2px) — the editorial near-square.** Buttons, inputs, cards and panels all share it. **Pills are not part of the system** (v1 used them; v2 does not).
- **`--radius-device` (2.25rem) — the one rounded object in the system**: the Season One phone-preview frame. It depicts hardware, not UI; nothing else may use it. (Tiny `rounded-full` dots inside the preview depict hardware/avatars and share this exemption.)
- Spacing: Tailwind v4 dynamic scale (multiples of `0.25rem`). Stay on the scale.
- Control heights: `sm` 36px (`h-9`), `md` 44px (`h-11`), `lg` 52px (`h-13`). Inputs are 48px (`h-12`).
- **The header is 56px (`h-14`)**, and the menu panel's top bar matches it exactly — same height, same `container-page` gutters, same negative margin on the button — so the close button lands on the pixel the trigger occupied. Anything that offsets for the header (`scroll-mt-14`, the cover's `100dvh-3.5rem`) follows this number; change them together.
- **Page measure: `container-page`** — `max-w-page` (70rem) with `px-6 sm:px-10` gutters. Every full-width section uses it; prose pages may narrow further (`max-w-2xl`).
- **Editorial grid: `grid-page`** — 4 columns on mobile, 8 from `sm`, 12 from `lg`, with responsive gutters. Place children with `col-span-*` per breakpoint. Use it for content-heavy pages (destinations, journal, comparison layouts); simple stacked sections do not need it.

## 5. Components (current)

- **`Button`** — variants `primary | outline | paper | ghost | outlineOnDark`, sizes `sm | md | lg`. Labels are uppercase bold at `tracking-label`; hover lifts a pixel, press compresses (`active:scale`), and the trailing arrow eases forward — all on `--ease-interaction`.
  - **CTAs are monochrome** (owner direction 2026-08-05): on cream surfaces the pair is `primary` (solid forest) + `outline`; on forest surfaces it is `paper` (solid cream) + `outlineOnDark`. Both fills are 11.44:1. **Terracotta is never a button fill** — it is the accent for type, dots and marks; the old terra-deep CTA was retired as a template tell.
  - `ghost` (text-only) is **situational** — allowed, but justify it in review. The former `ink` variant is gone: `primary` now is the forest fill.
  - Use `buttonVariants()` to style a `<Link>` as a button; `<ButtonArrow />` for the trailing arrow on a forward action.
- **`Input`** — `rounded-edge` field on `cream-deep`, terra-deep focus ring.
- **`WaveMotif`** — the three-line wave glyph, the island signature. Decorative accent only, at most once per section; tone follows the surface.
- **`Wordmark`** — the horizontal lockup, self-sized by a height class (`h-9` default; the footer passes `h-10`). `tone` follows the surface. The square cut-out marks still ship in `public/brand/` for the favicon, app icon and OG card; `WaveMark` (the standalone square-mark component) was removed with the lockup switch — nothing rendered it.
- **`BrandIntro`** — the brand veil (§3), rendered first in the root layout's body. Owns only the pre-paint decision script and the post-play cleanup; every visual decision lives in `globals.css` under the `intro-*` classes.
- **`SiteHeader`** / **`SiteFooter`** / **`SiteMenu`** — the shell, rendered by the root layout on every route. All navigation comes from the registry (§7).
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

`src/lib/site/nav.ts` is the single source of truth for every navigable route. The header, the site menu and the footer are all derived from it.

- **A route is added to the registry in the same PR that ships its page** — never before. This makes a link to a non-existent page structurally impossible.
- **The header names three things and no more** (owner direction, 2026-08-04): the mark, `OPERATOR_NAV`, and `PRIMARY_CTA`. Every other route is in `MENU_ITEMS`, reached through the menu — on desktop as well as on a phone. Adding a fourth item to the header is a design change, not a routing one, so it goes through review rather than through the registry.
- **The site is addressed to travellers by default.** The homepage, and any future page that does not say otherwise, speaks to them; operator-facing content belongs on `/operators`, which the header link exists to reach. A page that pitches both audiences at once ends up asking the visitor to self-identify before it has earned the right to (see `LeadForms`' `audiences` prop, which is how a page commits to one).
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
