# Issue Rulebook — agent-raised issues and PRs

> **Status: ratified 2026-08-02 by @VishwanthBarma on [#24](https://github.com/yuvoy-in/yuvoy-web/issues/24).** This is law. Change it by saying so on an issue, not by drifting from it.

Rules for issues and pull requests opened by an agent (Claude Code sessions) in `yuvoy-web` and `yuvoy-api`. Companion to [backend-team-issue-rulebook.md](backend-team-issue-rulebook.md), which governs FE ↔ BE coordination and is unchanged by this.

---

## 0. The rule that makes the rest work

**An agent will follow whatever convention exists, precisely and indefinitely.** That cuts both ways: a bad rule here gets applied a hundred times without anyone noticing. Prefer rules that fail loudly over rules that rely on judgement.

---

## 1. When _not_ to open an issue

The most valuable rule, so it comes first. **Do not open an issue when:**

- **The fix is smaller than the issue describing it.** Open a PR instead. If you can fix it in the time it takes to write it up, fix it.
- **A thread already exists.** Comment there. A second issue about the same thing splits the history.
- **It is a question, not a work item.** Ask in the existing thread or in the PR that raised it.
- **It is speculative.** "We may want X later" is a note in a doc, not an issue. Issues are for work someone will actually do.
- **You are about to do it now.** Do the work and reference the reason in the PR.

**Do open an issue when:** work is blocked on a decision or input only a human can give; the work belongs to another repo or another person; or the finding is real but out of scope for the current change.

---

## 2. Required structure

Every agent-raised issue:

- **TL;DR** — one sentence, first line, no preamble. What is being asked for.
- **Why** — the user-facing or technical reason. One paragraph.
- **Evidence** — commands run and their output, `file:line` references. Claims without evidence are opinions.
- **What was verified, and what was not** — see §5.
- **Blast radius** — what breaks if this is wrong, or "none, additive".

Anything longer than a screen needs the TL;DR to stand alone, because that is all that will be read.

## 3. Required structure — pull requests

- **First line states what changed and why**, not what files moved.
- **Surprises get their own heading.** If something did not work as expected, say so — that is the most useful part of the description.
- **Verification section quoting real command output** (§5).
- **Deferred work is listed with its reason**, not silently dropped.

---

## 4. Length and tone

- **Bug report:** under a screen. **Handover doc:** as long as it needs to be, but the TL;DR must stand alone.
- **State findings plainly.** No hedging, no padding, no restating the issue title back.
- **Never claim urgency the work does not have.** Priority is the label's job.

---

## 5. Verification claims — the strictest rule

> **Never write "works", "verified" or "tested" on its own.**

State **the exact command and its result**:

```
✅ pnpm typecheck && pnpm lint && pnpm build — green
✅ pnpm test — 29 passed
✅ pnpm test:e2e — 92 passed, 3 skipped (skipped = opt-in LIVE_API_E2E specs)
❌ Not verified: behaviour against the deployed API
```

- **"It compiles" is not "it works."** Say which one you mean.
- **Skipped tests are declared, with the reason.** A green run hiding skips is a false report.
- **What you could not verify is stated explicitly**, in the same place — not omitted.

---

## 6. Labels

| Label                                  | When                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| `agent`                                | On every agent-raised issue and PR. Non-negotiable — it is how you filter your queue. |
| `scope:fe` / `scope:be` / `scope:both` | Always.                                                                               |
| `priority:p0` / `p1` / `p2`            | Always. p0 = blocking.                                                                |
| `stage:*`                              | Only for cross-repo work (per the BE rulebook).                                       |
| `needs-decision`                       | The work is blocked on a human choice. Pair with a comment naming the choice.         |
| `blocked:business`                     | Blocked on copy, sign-off, an account or an asset — not on engineering.               |

---

## 7. Assignment

- **Agents do not assign issues to people.** Leave unassigned for the owner to triage — an agent cannot know who has capacity.
- **Exception:** a cross-repo ask goes to that repo's owner, because there is only one candidate.
- **Agents do not add reviewers.**

### Merging — ratified

| Target                   | Rule                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ |
| `dev` (staging)          | **Merge once CI is green.** No wait, no ask.                                   |
| Any red or pending check | **Never merge.** Not "probably fine", not "unrelated failure" — check the run. |
| `main` (production)      | **Never without the owner saying so**, in that session, for that release.      |

This exists because a PR was merged into `dev` with a red `e2e` check, which
then needed a follow-up fix. Two real defects were in that check. Confirm green
_before_ merging, not after.

---

## 8. Cross-repo requests

Follow [backend-team-issue-rulebook.md](backend-team-issue-rulebook.md) verbatim. It is current. In particular: **`Refs #N`, never `Closes #N`**, across repos — `Closes` auto-closes the issue and kills the handoff.

Do not work around a missing backend capability on the client. Raise it.

---

## 9. Business-gated work

When work is blocked on copy, sign-off, an asset or an account:

1. **Ship everything that is not blocked.** Do not hold four pages hostage to one.
2. **Open the blocked part as a draft PR**, so it cannot be merged by accident.
3. **Comment on the issue naming exactly what is needed and from whom**, and what unblocks it.
4. **Never invent the missing input** — not a founder story, not a safety claim, not a contact address, not a testimonial.

---

## 10. Truthfulness

This project removed a site that published invented prices, invented review counts and unapproved operator names. That is the standard everything is measured against.

- **Never add a price, rating, review count, availability claim, named partner or capability that does not exist** — in copy, in mock data, in structured data, or in an OG image.
- **Structured data counts as a claim** even though it is invisible on the page.
- If a design needs content that does not exist, **the content is the blocker** — say so rather than filling the gap.

---

## Ratification record

Settled on #24, 2026-08-02:

1. **`agent` label** — adopted. The label exists and goes on every agent-raised issue and PR.
2. **Draft PRs for business-gated work** — kept. It worked: `/safety` sat as a draft until sign-off, while the three pages beside it shipped.
3. **Merging** — see §7. Green CI → merge to `dev`; production always the owner's call.
4. **Length cap** — none. The TL;DR carries the weight instead, and must stand alone (§2).
