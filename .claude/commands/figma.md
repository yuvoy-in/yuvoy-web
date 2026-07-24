Convert the pasted design (Figma CSS or the Yuvoy prototype) into production code that conforms to the design system.

Required reading before you write any code:

- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — color tokens, type scale, spacing, component patterns, and conversion rules.

Treat any pasted export as **oversized relative to the real in-use scale** — calibrate the ratio and translate to the real scale, not pixel-for-pixel.

## Process

1. Read [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) in full first.
2. Identify the closest existing component (`src/components/ui`) and extend/compose it instead of re-implementing.
3. Strip artifacts: absolute positioning, fixed frame widths/heights, generated class names. Re-express with flex/grid.
4. Map every value (color, size, spacing, radius) to an existing token. Never invent intermediate values.
5. Mobile-first and responsive. No desktop-only fixed pixels.
6. Match the Tailwind-v4 + CVA styling pattern already in the repo.
7. Respect `prefers-reduced-motion` for any animation.

## Output

- Production-ready code only. No commentary.
- If a value doesn't snap cleanly to a token, state the ambiguity and your choice in one line, then proceed.
- If the design asks for a pattern the system forbids, call it out, suggest the conformant alternative, and ask before introducing it.
