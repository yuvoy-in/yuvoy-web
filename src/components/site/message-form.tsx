import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CONTACT_EMAIL,
  CONTACT_TOPICS,
  MESSAGE_FORM_LIVE,
} from "@/lib/site/contact";

/**
 * "Leave a note" — the message form.
 *
 * ## It is rendered, complete, and disabled
 *
 * `POST /v1/messages` does not exist yet (yuvoy-in/yuvoy-api#5), so every
 * control here carries `disabled` and the block carries a "Coming soon"
 * badge. Owner direction, 2026-08-07: show the whole thing rather than hide
 * it, so a visitor can see what is coming.
 *
 * **Disabled, not fake.** The alternative — a form that looks live and throws
 * the message away, or one that submits into an endpoint that answers 404 —
 * is the failure this whole rebuild exists to remove. A disabled control is
 * announced as disabled by every screen reader and skipped by the tab order,
 * so nobody types four paragraphs into something that cannot send them. The
 * two live channels sit directly above it and are what actually carries the
 * traffic today.
 *
 * When the endpoint lands (yuvoy-in/yuvoy-api#5): flip `MESSAGE_FORM_LIVE`,
 * make this a client component with the same react-hook-form + Zod shape the
 * lead forms use, and give it the seven states they have. The markup below is
 * deliberately close to theirs so that change is mechanical.
 *
 * **Update the Privacy page in the same change.** It currently states that the
 * only personal information the site collects is what you type into the
 * waitlist form, which is true precisely because this form cannot send. The
 * moment it can, that sentence is wrong.
 *
 * It is a server component while disabled — a form nobody can submit needs no
 * JavaScript at all.
 */
export function MessageForm() {
  const disabled = !MESSAGE_FORM_LIVE;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <h2
          id="message-heading"
          className="font-display tracking-display text-[clamp(1.75rem,3.5vw,2.25rem)] leading-tight font-normal"
        >
          Leave a note
        </h2>
        {disabled && (
          <span className="label border-terra-soft/40 text-terra-soft rounded-edge border px-3 py-1.5">
            Coming soon
          </span>
        )}
      </div>

      {disabled && (
        <p className="text-cream/70 mt-5 max-w-xl leading-relaxed">
          This form is not connected yet. Email us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-cream underline underline-offset-2"
          >
            {CONTACT_EMAIL}
          </a>{" "}
          or send a WhatsApp message and a person will read it.
        </p>
      )}

      <form
        className="mt-10 flex max-w-xl flex-col gap-5"
        // No action and no handler: there is nothing to submit to. Native
        // validation is off for the same reason the lead forms turn it off —
        // when this goes live, its errors are rendered, not browser-drawn.
        noValidate
      >
        {/* `fieldset[disabled]` disables every control inside it in one
            declaration, and cannot fall out of step with them the way a
            `disabled` prop repeated on six inputs can. */}
        <fieldset disabled={disabled} className="flex flex-col gap-5">
          <legend className="sr-only">Send Yuvoy a message</legend>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="m-name" className="label text-cream/70">
              Name
            </label>
            <Input
              tone="onDark"
              id="m-name"
              name="name"
              autoComplete="name"
              className="disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="m-email" className="label text-cream/70">
              Email
            </label>
            <Input
              tone="onDark"
              id="m-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="m-topic" className="label text-cream/70">
              I&rsquo;m contacting about
            </label>
            <select
              id="m-topic"
              name="topic"
              defaultValue={CONTACT_TOPICS[0].value}
              className="border-cream/20 bg-cream/5 text-cream focus-visible:border-terra-soft focus-visible:ring-terra-soft/40 rounded-edge h-12 w-full border px-4 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {CONTACT_TOPICS.map((topic) => (
                <option
                  key={topic.value}
                  value={topic.value}
                  className="bg-cream text-forest"
                >
                  {topic.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="m-message" className="label text-cream/70">
              Message
            </label>
            <textarea
              id="m-message"
              name="message"
              rows={5}
              className="border-cream/20 bg-cream/5 text-cream placeholder:text-cream/60 focus-visible:border-terra-soft focus-visible:ring-terra-soft/40 rounded-edge w-full resize-y border px-4 py-3 text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <Button
            type="submit"
            variant="paper"
            size="lg"
            className="self-start"
          >
            {disabled ? "Coming soon" : "Send"}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}
