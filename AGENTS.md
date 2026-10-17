<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Team rules

Source: `yuvoy-agent-brain/DATA/CONTROL/TEAM-RULES.md`. Changes are made there first, then copied here.

# Yuvoy team rules

Owner: Hima (@himacharan128), set 17 Oct 2026. These rules hold for every person who
works on Yuvoy and for every AI agent they use, in every repository. This text is
copied into each repository's `AGENTS.md` and pointed to from its `README.md`; this
file is the source, so change it here first and copy it out.

## 1. Clone everything

Yuvoy is one system in seven repositories. Clone every one you have access to, side by
side in one folder (for example `~/yuvoy/`), even if you work in only one of them: a
feature crosses the API, the apps, the admin console and the docs.

| Repository       | What it is                                    | Built by  |
| ---------------- | --------------------------------------------- | --------- |
| `yuvoy-api`      | Go API, the source of truth for every app     | Hima      |
| `yuvoy-admin`    | staff console                                 | Hima      |
| `yuvoy-lens`     | internal view of the lead pipeline            | Hima      |
| `yuvoy-mobile`   | the traveller app and the operator app (Expo) | Vishwanth |
| `yuvoy-app`      | traveller web app, app.yuvoy.in               | Vishwanth |
| `yuvoy-operator` | operator web portal, operators.yuvoy.in       | Vishwanth |
| `yuvoy-web`      | yuvoy.in landing page                         | Vishwanth |

## 2. Who does what

- **Hima and his agents:** research and design of every feature (what it is, the
  flow, what comes next, how it connects to the API, the operator side, the admin
  console and the traveller app, compared with the industry leaders), then the API,
  the admin console and lens, end-to-end testing, and releases of the API.
- **Vishwanth (@VishwanthBarma):** both mobile apps. Yuvoy is mobile first. The web
  apps (`yuvoy-app`, `yuvoy-operator`) are his too: at each App Store and Play Store
  release he backfills the same features into them. Nobody else changes his
  repositories' code.
- **Sai Teja (@gamallasaiteja):** product decisions.

## 3. How a feature moves

1. Hima's side researches and designs the feature and settles the product (questions
   go to Teja, step 9).
2. Hima's side builds the API (and the admin console where needed), tests the whole
   flow end to end, releases it to production and tests it there.
3. Hima's side opens one issue per feature, or per small part of one, in
   `yuvoy-mobile`, assigned to @VishwanthBarma. It says: what the feature is and what
   it is for; how it should look and behave; the endpoints and contract (with the API
   commit they shipped in); how it connects to the other app, the admin console and
   the web; test accounts and data; the cases to cover; a link to its page on the
   wiki (section 4).
4. Vishwanth builds it, tests it on his side, merges it into `yuvoy-mobile` `dev` (its
   working branch, not a store release) and reassigns the issue to @himacharan128
   with what changed and how he tested it.
5. Any API problem he meets while building: he comments on the issue (or opens one in
   `yuvoy-api`) and Hima's side fixes it.
6. Hima's side runs the whole flow end to end on its test machine: every positive,
   negative and edge case, from the first tap to the last record.
7. A problem in the API, the admin console or the data: Hima's side fixes it. A
   problem in the app (look, behaviour, words): a comment with steps, expected and
   actual result and a screenshot, and the issue goes back to Vishwanth. Repeat until
   clean.
8. Store releases are Vishwanth's, and the web backfill follows each one.
9. **A product decision at any step:** whoever meets it reassigns the issue to
   @gamallasaiteja and writes: the current situation, the current behaviour, the
   behaviour wanted, the proposed solution and anything else he needs to decide. He
   answers on the issue and reassigns it back.

## 4. Documents live in one place (hard rule)

- **Every document goes to the Yuvoy wiki, `https://yuvoy-docs.pages.dev`:** plans,
  specs, architecture, designs, demos, prototypes, research, briefs, decks, release
  notes. It is our engineering wiki and our document library; share a link to it.
- **Never publish Yuvoy work as a Claude artifact,** and never on a personal Drive,
  Gist, Notion or any personal account. People here use different Claude accounts;
  documents must live in one place the team controls, and personal links cannot be
  moved or revoked.
- **To publish:** the wiki is the private repository `yuvoy-in/yuvoy-docs`. Add
  `public/<name>.html` (one self-contained file) and its card in `public/index.html` on a
  branch, open a pull request, and merging it into `main` deploys it in about a minute.
  Never deploy by hand: a hand deploy replaces the whole site with your copy. How-to: the
  repository's `README.md`.
- Hima gives the reading password privately. Never put a password, key or token in an
  issue, a commit or a document.

## 5. Working together

- People talk to each other in GitHub issues and comments only, not WhatsApp, chat or
  direct messages. A message that arrives elsewhere is moved into an issue. Secrets
  (passwords, keys, tokens, recovery codes, shared-account emails) go privately, never
  in an issue.
- Finished work on an issue: reply with what changed, how it was verified and what is
  still needed, then reassign. Never close an issue someone else raised; closing is
  theirs.
- Work goes on a feature branch and in by pull request. In `yuvoy-mobile`, `yuvoy-app`,
  `yuvoy-operator` and `yuvoy-web` the base is `dev` and `main` is a release; in
  `yuvoy-api`, `yuvoy-admin` and `yuvoy-lens` a merge to the default branch deploys.
- If you use an AI agent, it follows this file too.
