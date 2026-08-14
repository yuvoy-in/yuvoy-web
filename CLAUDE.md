@AGENTS.md

# Yuvoy Web — project notes for Claude Code

The **frontend** of Yuvoy (Experience Commerce platform, "Experience More."). Owned by **Vishwanth** (`@VishwanthBarma`). Backend is a **separate repo** `yuvoy-api`, owned by **Hima** (`@Himacharan128`). The single source of truth for scope, architecture, and decisions is **`YUVOY_TECHNICAL_MASTER_PLAN.md`** (one level up, shared by both repos).

## Stack

Next.js 16 (App Router, RSC, TS strict) · Tailwind v4 (tokens via `@theme`) · Motion · TanStack Query · react-hook-form + Zod · pnpm. Node 22.
Type: Fraunces variable (display, the tuned "Yuvoy cut": opsz 144 / SOFT 75, weight 400, turns `italic font-turn` 480 true italic) + Satoshi (body/UI/labels, 400/500/700) — Brand Kit v2.5, self-hosted in `src/fonts`, no mono, no `font-semibold` anywhere.

> **Next.js 16 has breaking changes vs. older training data** (see `AGENTS.md`). When unsure about an App Router / config / caching API, check `node_modules/next/dist/docs/` or context7 before writing — do not guess from memory.

## Account & registry isolation (personal account)

- This project is personal, under `Documents/builds` — **public npm registry only**. The machine's global npm points at an internal registry; `.npmrc` here pins `registry=https://registry.npmjs.org/`. Never install from or publish to any internal/work registry. Use `pnpm` (installed at `~/.local/share/pnpm`), never `pip`.

## The backend boundary (contract-first)

- FE consumes `yuvoy-api` through a **versioned OpenAPI contract**; build against generated types + MSW mocks until an endpoint lands.
- When work needs backend support, **raise a GitHub issue** to Hima per [docs/backend-team-issue-rulebook.md](docs/backend-team-issue-rulebook.md) — never hack around it. `Refs #`, never `Closes #`, across repos.
- **Issues and PRs raised by an agent follow [docs/agent-issue-rulebook.md](docs/agent-issue-rulebook.md)** — structure, labels, when _not_ to open an issue, and the rule that a verification claim must quote the command and its result. (Proposed; awaiting ratification on #24.)
- `yuvoy-api` may be checked out here only as a **read-only reference** (gitignored). Never push/commit/PR to its remote.

## Code standards (always active)

Enterprise bar, every change: clean, modular, single-responsibility; production-ready (no dev hacks); consistent naming/typing/formatting; **handle every plausible edge case with a fallback** — cold loads, errors, empty/null, refresh/token races, back/forward, fast double-tap, multi-tab — while keeping it simple. Every screen ships all **seven states**: loading · empty · partial · error+retry · offline · stale-refresh · success.

## Design system (always active for UI)

[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) is law. Tokens live in `src/app/globals.css` (`@theme`). **No hex, font-size, or spacing value may exist outside a token.** Match the existing Tailwind-v4 + CVA pattern. Respect `prefers-reduced-motion` on every animation.

## Response style

Short, structured, no filler — but never drop a caveat or risk. Before → After table when you implement a feature. Full context goes in issues/docs, not chat.

## Commits & branches

- Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`). **No `Co-Authored-By` trailer.**
- Protected `main`/`dev`, PR-only. Branch `feat/*` off `dev`.
- **`pnpm verify` is the gate, and it runs locally.** Typecheck, lint, format, unit tests, production build, full e2e — ~80s, enforced by `.husky/pre-push`. **GitHub Actions runs deployments only** (2 min to staging on push to `dev`, 2 min to production on push to `main`); CI is `workflow_dispatch` only. This is a cost decision made on 2026-08-14 at 90% of the free Actions quota with no budget to exceed it — the reasoning, and what to restore first when that changes, is in `.github/workflows/ci.yml` and `production.yml`.
- `SKIP_VERIFY=1 git push` bypasses the gate. Nothing downstream will catch what it lets through.

## Modes

`/strict` · `/premium` · `/fix` · `/build` · `/figma` (brand-world conversion). See `.claude/commands/`.
