# API contracts

`openapi.yaml` is a **byte-exact mirror** of `yuvoy-api`, pinned by commit SHA in
[`PINNED`](./PINNED). It is not a proposal and it is not editable here.

## Why a mirror rather than a fork

This directory used to hold a hand-vendored fork. It was last touched on 8 August and
drifted a **breaking** version behind — `0.0.0-proposal` against the canonical `1.1.0`,
ten paths against twenty-two, with `Media`, `Slot` and `ExperienceSummary` in shapes the
API no longer served and three paths that had been deleted upstream entirely.

Nothing detected any of it for three weeks, because nothing was looking. See
[#135](https://github.com/yuvoy-in/yuvoy-web/issues/135).

D-101 settles the rule for all three frontends: **the API client is generated, never
hand-written, from the same pinned contract SHA. Generated code that drifts is a build
failure, not a code-review miss.** `yuvoy-app` and `yuvoy-operator` already work this
way; this repo now does too, pinned to the same commit, so all three reason about one
backend.

## Working with it

```bash
pnpm contract:check   # fails if this copy no longer matches the pinned ref
pnpm codegen          # regenerates src/lib/api/schema.ts from it
```

`contract:check` runs inside `pnpm verify`, which is the pre-push gate — Actions here
does deploys only.

**It is in `.prettierignore` on purpose.** Formatting it would make it differ from the
ref it is pinned to, which is both a drift failure and, worse, a way to hide a real
upstream change behind a formatting diff.

**When the contract moves:** re-pull it at the new SHA, update `PINNED`, run
`pnpm codegen`, and commit both. Never edit either file by hand.

## What this site actually consumes

Two endpoints, both `POST`, both hand-written `fetch` calls rather than a generated
client — the payload is one object and the response is one of four outcomes, which is
less code than wiring `openapi-fetch` for it:

| Endpoint | Where |
| --- | --- |
| `POST /v1/leads` | `src/lib/leads/api.ts` |
| `POST /v1/messages` | `src/lib/messages/api.ts` |

The generated schema is still the source of their **types** (`LeadInput`,
`MessageInput`, `LeadAudience`, `MessageTopic` and so on), which is the half that
actually drifts.

A network failure and a rejection are deliberately different outcomes in both — see the
comments in those files.
