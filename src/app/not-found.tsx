import Link from "next/link";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="label text-terra">404</p>
      <h1 className="font-display text-forest mt-5 text-4xl">
        This path leads nowhere.
      </h1>
      <p className="text-forest/70 mt-4 max-w-md">
        The page you&rsquo;re looking for isn&rsquo;t here — like a cove that
        moved with the tide.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-8")}>
        Back home
      </Link>
    </main>
  );
}
