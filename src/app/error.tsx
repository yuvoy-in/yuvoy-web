"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(observability): report to Sentry once wired.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="label text-terra">Something broke</p>
      <h1 className="font-display text-teal mt-5 text-4xl">
        A small wave, not a storm.
      </h1>
      <p className="text-teal/70 mt-4 max-w-md">
        An unexpected error occurred on our side. You can try again, or head
        back to safe harbour.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "ghost" })}>
          Home
        </Link>
      </div>
    </main>
  );
}
