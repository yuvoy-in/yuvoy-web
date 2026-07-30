import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { parseAudience } from "@/lib/waitlist/audience";

export const metadata: Metadata = {
  title: "Waitlist",
  description:
    "Be first to hear when Yuvoy opens — and tell us if you run experiences in the Andamans.",
};

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}) {
  const sp = await searchParams;
  const audience = parseAudience(sp.audience);

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="px-6 py-6 sm:px-10">
        <Link href="/" aria-label="Yuvoy home">
          <Wordmark />
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-16">
        <WaitlistForm audience={audience} />
      </section>
    </main>
  );
}
