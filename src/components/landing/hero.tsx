import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Type-led hero — no photography by design. The palette and Poppins carry
 * the register until rights-cleared media exists; nothing is simulated.
 *
 * Navigation lives in `SiteHeader`, not here.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col overflow-hidden">
      {/* Ambient warmth — a soft terracotta dawn over the cream canvas. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="from-terra/15 via-terra/5 absolute top-0 left-1/2 h-[65vh] w-[130vw] -translate-x-1/2 rounded-b-[100%] bg-linear-to-b to-transparent blur-3xl" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p
          className="rise label text-terra-deep"
          style={{ animationDelay: "0.05s" }}
        >
          Starting in the Andamans · Building for the world
        </p>
        <h1
          className="rise font-display text-teal mt-6 max-w-4xl text-[clamp(2.5rem,11vw,4.5rem)] leading-[1.03] tracking-tight text-balance"
          style={{ animationDelay: "0.15s" }}
        >
          Don&rsquo;t be a <em className="text-terra">tourist</em>.
        </h1>
        <p
          className="rise text-teal/70 mt-7 max-w-xl text-lg leading-relaxed sm:text-xl"
          style={{ animationDelay: "0.3s" }}
        >
          Yuvoy is building a new way to find real local experiences — on the
          water, across the islands and after dark. Opening this season in
          Havelock, Neil and Port Blair.
        </p>
        <div
          className="rise mt-10 flex w-full max-w-xs flex-col items-center gap-3 sm:w-auto sm:max-w-none sm:flex-row"
          style={{ animationDelay: "0.45s" }}
        >
          <a
            href="#register"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
          >
            Register interest
          </a>
          <a
            href="#providers"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            Onboard as a provider
          </a>
        </div>
      </div>
    </section>
  );
}
