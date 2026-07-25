# Git Workflow — yuvoy-web

## Branches

| Branch                       | Purpose                        | Direct push     | Deploy                        |
| ---------------------------- | ------------------------------ | --------------- | ----------------------------- |
| `main`                       | Production. Always deployable. | ❌ PR only      | Production — Actions → Vercel |
| `dev`                        | Staging / integration.         | ❌ PR only      | Staging — Actions → Vercel    |
| `feat/*`, `fix/*`, `chore/*` | Short-lived work               | ✅ (you own it) | CI only (no deploy)           |

`main` and `dev` are **protected**: no direct push, no force-push, require PR + green CI.

## Daily flow

1. Start from latest `dev`: `git checkout dev && git pull` → `git checkout -b feat/short-name`.
2. Work, commit small (Conventional Commits), push often.
3. PR `feat/*` → `dev`. Green CI + self-review. Squash-merge, delete branch.
4. When staging is good, PR `dev` → `main` (regular merge). Tag the release.

## Rules

- One feature = one branch off `dev`. Don't chain feature branches.
- Never force-push or commit directly to `main`/`dev`.
- `pnpm build` must pass before every push (enforced by `.claude/hooks/pre-push-build.sh`).
- **No `Co-Authored-By` trailer.**
- Cross-repo work with `yuvoy-api` goes through GitHub issues — see [backend-team-issue-rulebook.md](backend-team-issue-rulebook.md).
