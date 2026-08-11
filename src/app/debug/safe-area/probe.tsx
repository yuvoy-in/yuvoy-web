"use client";

import * as React from "react";

/**
 * Live readings of everything the island behaviour depends on, updated on
 * every scroll/resize/visualViewport event. Eight alternating full-height
 * bands reproduce the cream/forest rhythm of the real pages, so Safari's
 * top-edge treatment can be watched over both tones.
 */

interface Readings {
  ua: string;
  metaViewport: string;
  envTop: string;
  envBottom: string;
  envLeft: string;
  innerH: number;
  clientH: number;
  screenH: number;
  vvOffsetTop: number;
  vvHeight: number;
  scrollY: number;
  headerPadTop: string;
  headerTop: number;
  headerHeight: number;
}

function read(probe: HTMLDivElement | null): Readings {
  const header = document.querySelector("header");
  const rect = header?.getBoundingClientRect();
  const style = probe ? getComputedStyle(probe) : null;
  return {
    ua: navigator.userAgent.replace(/Mozilla\/5\.0 \([^)]*\) /, ""),
    metaViewport:
      document
        .querySelector('meta[name="viewport"]')
        ?.getAttribute("content") ?? "(none)",
    envTop: style?.paddingTop ?? "-",
    envBottom: style?.paddingBottom ?? "-",
    envLeft: style?.paddingLeft ?? "-",
    innerH: window.innerHeight,
    clientH: document.documentElement.clientHeight,
    screenH: window.screen.height,
    vvOffsetTop: Math.round(window.visualViewport?.offsetTop ?? -1),
    vvHeight: Math.round(window.visualViewport?.height ?? -1),
    scrollY: Math.round(window.scrollY),
    headerPadTop: header ? getComputedStyle(header).paddingTop : "-",
    headerTop: Math.round(rect?.top ?? -1),
    headerHeight: Math.round(rect?.height ?? -1),
  };
}

export function SafeAreaProbe() {
  const probeRef = React.useRef<HTMLDivElement>(null);
  const [r, setR] = React.useState<Readings | null>(null);

  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setR(read(probeRef.current));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    const tick = setInterval(schedule, 500);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
      clearInterval(tick);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <main className="bg-cream text-forest">
      {/* Invisible probe: its padding IS the live env() values. */}
      <div
        ref={probeRef}
        aria-hidden
        className="pointer-events-none fixed h-0 w-0"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
        }}
      />

      {/* A hairline drawn exactly at the top inset boundary: everything above
          it is what the island covers. If it hugs the screen top, insets are
          not being reported. */}
      <div
        aria-hidden
        className="bg-terra fixed inset-x-0 z-50 h-0.5"
        style={{ top: "env(safe-area-inset-top)" }}
      />

      {/* The readings, pinned above the home indicator. */}
      <div
        className="bg-forest text-cream rounded-edge fixed inset-x-3 z-50 p-3 text-[11px] leading-relaxed"
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {r ? (
          <>
            <p className="truncate">{r.ua}</p>
            <p className="truncate">meta: {r.metaViewport}</p>
            <p>
              env top <b>{r.envTop}</b> · bottom <b>{r.envBottom}</b> · left{" "}
              <b>{r.envLeft}</b>
            </p>
            <p>
              innerH <b>{r.innerH}</b> · docH <b>{r.clientH}</b> · screenH{" "}
              <b>{r.screenH}</b>
            </p>
            <p>
              vv.offsetTop <b>{r.vvOffsetTop}</b> · vv.height{" "}
              <b>{r.vvHeight}</b> · scrollY <b>{r.scrollY}</b>
            </p>
            <p>
              header padTop <b>{r.headerPadTop}</b> · top <b>{r.headerTop}</b> ·
              height <b>{r.headerHeight}</b>
            </p>
          </>
        ) : (
          <p>reading…</p>
        )}
      </div>

      {Array.from({ length: 8 }, (_, i) => (
        <section
          key={i}
          className={
            i % 2
              ? "bg-cream text-forest flex min-h-svh items-center justify-center"
              : "bg-forest text-cream flex min-h-svh items-center justify-center"
          }
        >
          <p className="font-display text-3xl">Band {i + 1}</p>
        </section>
      ))}
    </main>
  );
}
