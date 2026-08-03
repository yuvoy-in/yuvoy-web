"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";

/**
 * App-wide client providers. Children remain server components — only this
 * boundary is client. TanStack Query for server state.
 *
 * `<MotionConfig reducedMotion="user">` used to wrap these; it went when the
 * last `motion/react` component did (see docs/DESIGN_SYSTEM.md §3). All
 * remaining animation is CSS, which the global `prefers-reduced-motion` block
 * in globals.css already neutralises. **Restore MotionConfig in the same
 * change that reintroduces any Motion component** — it is what makes Motion
 * itself honour the preference.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider>{children}</AnalyticsProvider>
    </QueryClientProvider>
  );
}
