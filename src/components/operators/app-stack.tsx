/**
 * The improvised stack every operator runs today, each tool struck through.
 *
 * The strike is the argument: six tools, each about to be unnecessary. It was
 * previously drawn on scroll; it is now simply there (owner direction,
 * 2026-08-03, removing scroll-triggered motion), which also makes this a
 * server component with no client JavaScript at all.
 *
 * Two of the six are named generically (spreadsheets, design tools) rather
 * than by product. This is reportage, not endorsement, and an operator who
 * uses Sheets rather than Excel or Figma rather than Canva should still see
 * their own week described. The two that are named — Instagram and WhatsApp —
 * are named because in this market they are the specific tools, not a category.
 */
const STACK = [
  { tool: "Instagram", job: "Marketing" },
  { tool: "WhatsApp", job: "Enquiries" },
  { tool: "Calendar", job: "Availability" },
  { tool: "Spreadsheets", job: "Bookings" },
  { tool: "Payment links", job: "Payments" },
  { tool: "Design tools", job: "Content" },
];

export function AppStack() {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {STACK.map((app) => (
        <li
          key={app.tool}
          className="border-paper-line bg-paper rounded-edge after:bg-terra relative border px-3 py-4 text-center after:absolute after:top-[42%] after:right-[12%] after:left-[12%] after:h-px"
        >
          <p className="text-forest truncate text-sm font-medium">{app.tool}</p>
          <p className="label text-forest/75 mt-1.5 text-[9px]">{app.job}</p>
        </li>
      ))}
    </ul>
  );
}
