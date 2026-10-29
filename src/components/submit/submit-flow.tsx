"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { StatusNotice } from "@/components/site/status-notice";
import {
  loadSubmitForm,
  type Confirmation,
  type FormLoad,
  type Receipt,
  type VocabularyTerm,
} from "@/lib/submit/api";
import type { PlaceOption } from "@/lib/submit/places";
import {
  EMPTY_SUBMISSION,
  type SubmissionFormValues,
} from "@/lib/submit/schema";
import { WORDS } from "@/lib/submit/words";
import { CodeStep } from "./code-step";
import { SubmitDone } from "./submit-done";
import { SubmitForm } from "./submit-form";
import { useOnline } from "./use-online";

type View =
  | { name: "loading" }
  | { name: "soon" }
  | { name: "error" }
  | { name: "form" }
  | { name: "code"; receipt: Receipt }
  | { name: "done"; confirmation: Confirmation };

interface Lists {
  places: PlaceOption[];
  categories: VocabularyTerm[];
}

interface State {
  view: View;
  lists: Lists | null;
}

function fromLoad(load: FormLoad): State {
  if (load.kind === "open") {
    return {
      view: { name: "form" },
      lists: { places: load.places, categories: load.categories },
    };
  }
  return { view: { name: load.kind }, lists: null };
}

/**
 * `/submit`, from the first read to the reference (yuvoy-web#177, R3-T3).
 *
 * ## States
 *
 *  - **loading**: the three reads on mount (app config, places, vocabulary).
 *    The form never shows before the release is known.
 *  - **soon**: the release is not `all`, could not be read, or there is no
 *    discover place; and the stale case, a `404` on submit from a config
 *    that changed under an open page (issue case 1).
 *  - **error**: places or the vocabulary could not be read while the release
 *    is open, with "Try again" (note section 6 point 3).
 *  - **form**, **code**, **done**: the three steps.
 *
 * Offline is not a state of its own: each step keeps its fields and turns
 * its buttons off while the browser says it is offline.
 *
 * ## What is kept, and where
 *
 * The typed values live here, in memory, so the code step can hand them back
 * to the form, and so can a stale "soon". Never in browser storage, because
 * they hold an email address (point 11 A); a reload starts again. They are
 * dropped the moment the event is with our team, and "Send another event"
 * starts from an empty form.
 */
export function SubmitFlow() {
  const online = useOnline();
  const [state, setState] = React.useState<State>({
    view: { name: "loading" },
    lists: null,
  });
  const [values, setValues] =
    React.useState<SubmissionFormValues>(EMPTY_SUBMISSION);
  /** A new key is a new, empty form: react-hook-form reads defaults once. */
  const [formKey, setFormKey] = React.useState(0);

  React.useEffect(() => {
    let live = true;
    loadSubmitForm().then((load) => {
      if (live) setState(fromLoad(load));
    });
    return () => {
      live = false;
    };
  }, []);

  function retry() {
    setState({ view: { name: "loading" }, lists: null });
    loadSubmitForm().then((load) => setState(fromLoad(load)));
  }

  const show = (view: View) => setState((s) => ({ ...s, view }));
  const { view, lists } = state;

  switch (view.name) {
    case "loading":
      return <Loading />;

    case "soon":
      return (
        <StatusNotice className="mt-8">
          <p>{WORDS.soon}</p>
        </StatusNotice>
      );

    case "error":
      return (
        <div className="mt-8 flex flex-col items-start gap-6">
          <StatusNotice>
            <p>{WORDS.loadFailed}</p>
          </StatusNotice>
          <Button type="button" variant="outline" onClick={retry}>
            {WORDS.tryAgain}
          </Button>
        </div>
      );

    case "form":
      return lists ? (
        <SubmitForm
          key={formKey}
          places={lists.places}
          categories={lists.categories}
          initial={values}
          online={online}
          onSent={(receipt, typed) => {
            setValues(typed);
            show({ name: "code", receipt });
          }}
          onClosed={(typed) => {
            setValues(typed);
            show({ name: "soon" });
          }}
        />
      ) : null;

    case "code":
      return (
        <CodeStep
          receipt={view.receipt}
          online={online}
          onConfirmed={(confirmation) => {
            setValues(EMPTY_SUBMISSION);
            show({ name: "done", confirmation });
          }}
          onBack={() => show({ name: "form" })}
        />
      );

    case "done":
      return (
        <SubmitDone
          confirmation={view.confirmation}
          onAnother={() => {
            setValues(EMPTY_SUBMISSION);
            setFormKey((key) => key + 1);
            show({ name: "form" });
          }}
        />
      );
  }
}

/**
 * The shape of the form while the reads are out, so the page does not jump
 * when it arrives. Decorative, and hidden from assistive tech; the status line
 * is what a screen reader gets. The pulse is on blocks, never on text (the
 * reason is in `app/loading.tsx`), and stops under reduced motion.
 */
function Loading() {
  return (
    <div className="mt-8">
      <p role="status" className="sr-only">
        {WORDS.loading}
      </p>
      <div
        aria-hidden
        className="flex flex-col gap-6 motion-safe:animate-pulse"
      >
        <div className="bg-paper-deep h-4 w-3/4" />
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex flex-col gap-1.5">
            <div className="bg-paper-deep h-3 w-32" />
            <div className="bg-paper-deep rounded-edge h-12 w-full" />
          </div>
        ))}
        <div className="bg-paper-deep rounded-edge h-12 w-40" />
      </div>
    </div>
  );
}
