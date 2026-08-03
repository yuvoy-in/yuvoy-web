"use client";

import * as React from "react";

/**
 * The improvised stack every operator runs today, struck through one by one
 * as the grid scrolls into view. The strike is the argument — six tools,
 * each about to be unnecessary — so it draws once, left to right, and stays.
 *
 * CSS transitions only (neutralised globally by reduced-motion); the
 * component's JS just flips a data attribute when the grid is seen.
 */
const STACK = [
  { tool: "Instagram", job: "Marketing" },
  { tool: "WhatsApp", job: "Enquiries" },
  { tool: "Calendar", job: "Scheduling" },
  { tool: "Excel", job: "Bookings" },
  { tool: "Payment links", job: "Payments" },
  { tool: "Canva", job: "Content" },
];

/** Left-to-right stagger; dynamic delay utilities, one per column. */
const STRIKE_DELAYS = [
  "after:delay-0",
  "after:delay-100",
  "after:delay-200",
  "after:delay-300",
  "after:delay-400",
  "after:delay-500",
];

export function AppStack() {
  const ref = React.useRef<HTMLUListElement>(null);
  const [seen, setSeen] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(element);
    return () => io.disconnect();
  }, []);

  return (
    <ul
      ref={ref}
      data-in={seen || undefined}
      className="group grid grid-cols-2 gap-2 sm:grid-cols-3"
    >
      {STACK.map((app, i) => (
        <li
          key={app.tool}
          className={`border-cream-line bg-cream-deep rounded-edge after:bg-terra relative border px-3 py-4 text-center after:absolute after:top-[42%] after:right-[12%] after:left-[12%] after:h-px after:origin-left after:scale-x-0 after:transition-transform after:duration-500 after:ease-[var(--ease-cinematic)] group-data-[in]:after:scale-x-100 ${STRIKE_DELAYS[i]}`}
        >
          <p className="text-forest truncate text-sm font-medium">{app.tool}</p>
          <p className="label text-forest/75 mt-1.5 text-[9px]">{app.job}</p>
        </li>
      ))}
    </ul>
  );
}
