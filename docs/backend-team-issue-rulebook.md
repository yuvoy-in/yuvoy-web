# Issue Rulebook — FE ↔ BE coordination

Operating rules for coordinating `yuvoy-web` (FE, **@VishwanthBarma**) with `yuvoy-api` (BE, **@Himacharan128**). Issues are the **only** sanctioned channel for cross-repo asks. Raise them in `yuvoy-in/yuvoy-api`.

## The rules

1. **One issue = one shippable action item** that survives BE → FE → done. Different surface/responsibility → new issue.
2. **Bodies are self-contained.** Required sections:
   - **Context** — what's needed and why now.
   - **Current state** — cited code (`file:line`), actual lines.
   - **What to do** — numbered, specific (endpoint paths, field names, types).
   - **Acceptance criteria** — independently verifiable checklist.
   - **FE handoff** — the exact contract FE consumes: JSON shape, fields, error codes, sample req/res. (Skip only for BE-internal changes FE never touches.)
3. **Labels required, not source of truth.** `scope:be|fe|both` · `priority:p0|p1|p2` · `stage:be-in-progress|fe-integration|blocked`. Real state = assignee + latest comment + open/closed.
4. **Comment when state changes.** `@`-mention the person who must act (that fires the notification). Don't broadcast on issues your diff doesn't touch.
5. **Ownership follows the work.** When a BE PR merges + deploys for an issue needing FE: reassign to `@VishwanthBarma`, comment the contract + deploy ref, swap `stage:be-in-progress` → `stage:fe-integration`. **BE PRs use `Refs #N`, never `Closes #N`** (that auto-closes and kills the handoff).
6. **Close on codebase verification**, not vibes — endpoints wired, types match shipped shape, typecheck + build green, contract diffed. Not gated on manual human QA.

## Contract-first reminder

BE publishes/updates the OpenAPI spec in `yuvoy-api/contracts/` **before** implementing. FE builds against generated types + MSW mocks until the endpoint is live. Breaking contract changes need a deprecation window + an issue to FE.
