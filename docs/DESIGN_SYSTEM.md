# Yuvoy Design System

Single source of truth for visual design. **Every color, font, and spacing value used in the app must map to a token here.** Never invent a value that falls between tokens — add a token (with review) instead.

Direction: cinematic minimalism — full-screen frames, atmospheric imagery, film grain, generous space, slow considered motion. Cream editorial surfaces; Ink immersive scenes.

## 0. Architecture rule

- Styling system: **Tailwind v4** utilities + **CVA** for component variants. Tokens are CSS custom properties in `src/app/globals.css` under `@theme`.
- Compose from `src/components/ui` primitives; do not re-implement.
- Class merging via `cn()` (`src/lib/cn.ts`).

## 1. Color tokens

Brand Kit v1 (ratified 2026-07-31). Contrast ratios measured against WCAG 2.2.

| Token / utility | Hex       | Role                                                            |
| --------------- | --------- | --------------------------------------------------------------- |
| `cream`         | `#F5F2EC` | Canvas — default page background                                |
| `cream-deep`    | `#EDE8DE` | Raised surfaces, inputs, cards on cream                         |
| `cream-line`    | `#DBD2BF` | Hairline borders on cream                                       |
| `teal`          | `#0F4C5C` | Primary ink — text, headings, wordmark, primary buttons (8.5:1) |
| `terra`         | `#C96A3D` | Accent — enso dot, LARGE display accents only (3.3:1 on cream)  |
| `terra-deep`    | `#8F4522` | Text-capable accent — labels, errors, accent buttons (6.2:1)    |
| `terra-soft`    | `#D98C63` | Accent for labels on `ink` surfaces (6.0:1 on ink)              |
| `ink`           | `#1C2321` | Immersive scenes — night, depth backgrounds (14.3:1 vs cream)   |

**The terra rule:** `terra` fails AA for normal-size text on cream (3.3:1). It
may appear only as decoration or at large-text sizes (≥24px / ≥18.7px bold).
Anything a visitor reads at body/label size uses `terra-deep` on cream and
`terra-soft` on ink. Accent buttons are `bg-terra-deep text-cream`.

Muted/secondary shades come from **opacity modifiers on `teal`**, not new tokens: `text-teal/70` (secondary), `/55` (tertiary/labels), `/45` (faint), `/20`–`/12` (borders/fills).

## 2. Typography

- **Display — Fraunces** (`font-display`). Italic reserved for expressive headlines. Loaded via `next/font` with `normal` + `italic`.
- **UI / body — Inter** (`font-sans`, the default).
- **Label** — the `label` utility: uppercase, `text-xs`, `font-medium`, `tracking-label` (0.22em). The brand's editorial voice for eyebrows and nav.
- **Wordmark** — `tracking-wordmark` (0.38em) on display caps; see `<Wordmark />`.

Scale: use Tailwind's type scale (`text-sm`…`text-7xl`). Headlines `font-display`; everything else inherits Inter.

## 3. Motion

- Token: `--ease-cinematic` (`cubic-bezier(0.22,1,0.36,0.16)`).
- CSS entrance: the `rise` utility (opacity + translateY, 1s). Prefer this for above-the-fold (zero JS).
- JS motion: **Motion** (`motion/react`) via the `<Reveal>` component for scroll-reveal. All motion is wrapped in `<MotionConfig reducedMotion="user">` (providers) — **never bypass it**. Every animation must degrade cleanly under `prefers-reduced-motion`.
- Smooth scroll (Lenis): queued — mount guarded by reduced-motion.

## 4. Radius, spacing, sizing

- Radius: pills (`rounded-full`) for buttons/inputs/chips — the brand's soft register. Cards use `rounded-2xl`/`rounded-3xl`.
- Spacing: Tailwind v4 dynamic scale (multiples of `0.25rem`). Stay on the scale.
- Control heights: `sm` 36px (`h-9`), `md` 44px (`h-11`), `lg` 52px (`h-13`).

## 5. Components (current)

- `Button` — variants `primary | accent | outline | ghost`, sizes `sm | md | lg`. Use `buttonVariants()` to style a `<Link>` as a button.
- `Input` — pill field on `cream-deep`, terra focus ring.
- `Wordmark` — YUVOY caps + terra enso dot.
- Growing set: ExperienceCard, FeedPlayer, AvailabilityPicker, PriceBreakdown (as screens land).

## 6. Accessibility (release gate)

WCAG 2.2 AA. Keyboard-complete flows; visible focus (`focus-visible:ring-terra-deep`); `aria-invalid` + `role="alert"` on form errors; contrast-checked pairings (terra only at large sizes; readable accents use terra-deep (cream) / terra-soft (ink)). axe runs in CI.

## 7. Figma / prototype → code

No Figma yet — the [prototype](https://claude.ai/public/artifacts/024b0d79-4fb0-44aa-a4ed-c9ec4d36ef5f) + brand docs are reference. Any pasted export is oversized vs. real scale: calibrate the ratio, snap every value to a token, re-express with flex/grid, mobile-first. See `.claude/commands/figma.md`.
