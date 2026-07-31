import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

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
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
      <Link href="/" aria-label="Yuvoy home">
        <Wordmark />
      </Link>
      <h1 className="font-display text-teal mt-10 text-4xl">Privacy</h1>
      <div className="text-teal/70 mt-6 flex flex-col gap-4 text-sm leading-relaxed">
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
      </div>
      <Link
        href="/"
        className="label text-teal/55 hover:text-teal mt-10 inline-block"
      >
        ← Back home
      </Link>
    </main>
  );
}
