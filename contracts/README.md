# API Contracts

**Proposal · v0.** `openapi.yaml` is the FE ↔ BE contract for Yuvoy — the source of truth for the request/response shapes the frontend consumes.

## Status

- **Owner: Backend** (Hima, `yuvoy-api`). Once `yuvoy-api` exists, the canonical spec moves there under `contracts/`; this copy is the proposal + the frontend's build-time input until then.
- Versioned under `/v1`. Breaking changes require a deprecation window + a GitHub issue to the consumer.

## Conventions

- **Money** — integer minor units + currency (`amountMinor`, `currency`). Never floats.
- **Time** — ISO-8601 UTC. Local-time logic (cancellation windows) carries an explicit timezone server-side.
- **Pagination** — cursor (`?cursor&limit`); responses return `nextCursor`.
- **Idempotency** — money-mutating endpoints require an `Idempotency-Key` header.
- **Errors** — `{ error: { code, message, details?, requestId? } }`.
- **Auth** — JWT bearer; short-lived access + rotating refresh (OTP + Google).

## Frontend usage

- `pnpm codegen` regenerates `src/lib/api/schema.ts` from this file (openapi-typescript).
- Consume types via the aliases in `src/lib/api/types.ts` (e.g. `Experience`, `ExperienceSummary`).
- Until live endpoints exist, data comes from **typed local seed** (`src/lib/experiences/data.ts`) that conforms to these schemas — swapping to the real API client is a change confined to the data accessors.
