import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  robots: { index: false, follow: false },
};

/**
 * PLACEHOLDER — release blocker.
 *
 * The business-approved Privacy Policy replaces this page before lead capture
 * goes live publicly. Until then this page states, truthfully and minimally,
 * how registration data is handled. It makes no claims beyond what the system
 * actually does.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10 sm:py-24">
      <h1 className="font-display text-teal text-4xl font-extrabold tracking-tight">
        Privacy
      </h1>
      <div className="text-teal/75 mt-6 flex flex-col gap-4 text-sm leading-relaxed">
        <p>
          The full Yuvoy Privacy Policy is being finalised and will be published
          here before launch. Until then, this is exactly what happens with what
          you submit:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Registration details — your name, WhatsApp number, optional email
            and stated preferences — are stored securely and used only to
            contact you about Yuvoy&rsquo;s launch.
          </li>
          <li>
            Marketing updates are sent only if you ticked the separate, optional
            box.
          </li>
          <li>Your details are never sold or shared with third parties.</li>
          <li>
            Write to us from your registered contact and we&rsquo;ll delete your
            registration.
          </li>
        </ul>

        <h2 className="font-display text-teal mt-6 text-xl font-bold tracking-tight">
          Analytics
        </h2>
        <p>
          Two things can run on this site, and they behave very differently.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-teal font-semibold">
              Product analytics (PostHog)
            </strong>{" "}
            — runs <strong className="text-teal font-semibold">only</strong> if
            you choose &ldquo;Allow analytics&rdquo;. Before you do, none of it
            is loaded and no request is made to it at all. It is hosted in the
            EU, and the events it records carry no name, email, phone number or
            registration reference — only which kind of page you were on, which
            island or interest was selected, and whether a form was started,
            failed validation or was submitted. There is deliberately no way to
            connect an event to your registration. Session recording and
            automatic click tracking are off, and no visitor profile is created.
          </li>
          <li>
            <strong className="text-teal font-semibold">
              Speed Insights (Vercel)
            </strong>{" "}
            — always on in production. It measures page loading performance
            only. It builds no visitor profile and records nothing about who you
            are or what you did.
          </li>
        </ul>
        <p>
          You can change your analytics choice at any time using{" "}
          <strong className="text-teal font-semibold">Privacy choices</strong>{" "}
          at the bottom of any page. Declining, or never choosing, means nothing
          is captured.
        </p>
      </div>
      <Link
        href="/"
        className="label text-teal/75 hover:text-teal mt-10 inline-block"
      >
        ← Back home
      </Link>
    </main>
  );
}
