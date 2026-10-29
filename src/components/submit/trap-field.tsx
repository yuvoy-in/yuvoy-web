import type { UseFormRegisterReturn } from "react-hook-form";
import { WORDS } from "@/lib/submit/words";

/**
 * The `extra` field: a trap a person never sees and a bot fills.
 *
 * Filled, the API answers a normal `202` with a made-up id, stores nothing and
 * sends nothing, so the page goes to the code step as usual and cannot tell.
 * The page never clears or checks it; it is sent as it is.
 *
 * Moved out of view rather than `display: none`, which a bot reads as "skip
 * me". Unlike the lead forms' honeypot it is **not** `aria-hidden` (point 7 A):
 * a screen reader that reaches it reads "Leave this empty", which is the one
 * thing that person needs to know about it. `tabIndex -1` keeps it out of the
 * keyboard order, and `autoComplete off` stops a browser filling it for a
 * person, which would make that person's event vanish without a word.
 */
export function TrapField({
  registration,
}: {
  registration: UseFormRegisterReturn<"extra">;
}) {
  return (
    <div data-trap className="absolute top-0 -left-[9999px]">
      <label htmlFor="submit-extra">{WORDS.labels.extra}</label>
      <input
        id="submit-extra"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...registration}
      />
    </div>
  );
}
