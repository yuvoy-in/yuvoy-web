/**
 * The improvised stack every operator runs today, each tool struck through.
 *
 * The strike is the argument: six tools, each about to be unnecessary. It was
 * previously drawn on scroll; it is now simply there (owner direction,
 * 2026-08-03, removing scroll-triggered motion), which also makes this a
 * server component with no client JavaScript at all.
 */
const STACK = [
  { tool: "Instagram", job: "Marketing" },
  { tool: "WhatsApp", job: "Enquiries" },
  { tool: "Calendar", job: "Scheduling" },
  { tool: "Excel", job: "Bookings" },
  { tool: "Payment links", job: "Payments" },
  { tool: "Canva", job: "Content" },
];

export function AppStack() {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {STACK.map((app) => (
        <li
          key={app.tool}
          className="border-cream-line bg-cream rounded-edge after:bg-terra relative border px-3 py-4 text-center after:absolute after:top-[42%] after:right-[12%] after:left-[12%] after:h-px"
        >
          <p className="text-forest truncate text-sm font-medium">{app.tool}</p>
          <p className="label text-forest/75 mt-1.5 text-[9px]">{app.job}</p>
        </li>
      ))}
    </ul>
  );
}
