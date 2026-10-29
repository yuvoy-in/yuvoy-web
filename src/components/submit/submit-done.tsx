"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import type { Confirmation } from "@/lib/submit/api";
import { WORDS } from "@/lib/submit/words";

/**
 * Step three: the event is with our team.
 *
 * The API's `message` as sent ("Thanks. Your event is with our team. Someone
 * checks every event before it shows, usually within two working days."),
 * or after a `409` its "This event is already with our team.", then the
 * reference. Nothing about the event's state after this: the page never shows
 * it, and the organiser hears our decision by email.
 */
export function SubmitDone({
  confirmation,
  onAnother,
}: {
  confirmation: Confirmation;
  onAnother: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  // A new step: move focus so a screen reader reads the outcome.
  React.useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="mt-8 flex flex-col gap-8">
      <div
        ref={ref}
        tabIndex={-1}
        className="border-paper-line bg-paper-deep rounded-edge flex flex-col gap-4 border p-6 focus:outline-none sm:p-7"
      >
        {confirmation.message && (
          <p className="font-display text-forest tracking-display text-xl leading-snug font-normal text-balance">
            {confirmation.message}
          </p>
        )}
        {confirmation.reference && (
          <p className="text-forest/75 leading-relaxed">
            {WORDS.done.reference(confirmation.reference)}
          </p>
        )}
      </div>
      <Button
        type="button"
        size="lg"
        className="self-start"
        onClick={onAnother}
      >
        {WORDS.done.another}
      </Button>
    </div>
  );
}
