/**
 * 410 Gone for retired routes.
 *
 * The pre-launch site published /experiences, /journal and /philosophy pages
 * (including seeded experience details) that were removed at the landing
 * relaunch. A 404 tells crawlers "maybe temporary"; 410 tells them the page is
 * intentionally gone, which is what gets stale results dropped fastest.
 */
export function gone(): Response {
  return new Response(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Gone · Yuvoy</title>
</head>
<body style="font-family: system-ui, sans-serif; background: #f5f2ec; color: #0f4c5c; display: grid; place-items: center; min-height: 100vh; margin: 0;">
  <main style="text-align: center; padding: 2rem;">
    <h1 style="font-weight: 600;">This page has been retired.</h1>
    <p><a href="/" style="color: #8f4522;">See what Yuvoy is building →</a></p>
  </main>
</body>
</html>`,
    { status: 410, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
