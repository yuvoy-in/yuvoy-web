/**
 * The site's two FAQs, kept short on purpose.
 *
 * An FAQ is where a pre-launch site goes to argue with itself. Both lists are
 * capped — three questions for travellers, four for operators — and both
 * answer the question that was actually asked rather than restating the
 * product's limitations a fourth time.
 *
 * Every answer must remain literally true. If a capability lands, the answer
 * changes in the same change that ships it.
 */

export interface Faq {
  question: string;
  answer: string;
}

/** Beneath the traveller waitlist. Three, and no more. */
export const WAITLIST_FAQS: Faq[] = [
  {
    question: "Can I book today?",
    answer:
      "Not yet. Yuvoy is currently preparing its first collection of experiences.",
  },
  {
    question: "Does joining cost anything?",
    answer: "No. There is no fee or payment required.",
  },
  {
    question: "How will you contact me?",
    answer: "Using the WhatsApp number or email address you provide.",
  },
];

/** On the operators page. Three, and no more. */
export const OPERATOR_FAQS: Faq[] = [
  {
    question: "Does applying cost anything?",
    answer:
      "No. Applying starts a conversation and does not create a fee or obligation.",
  },
  {
    question: "Do I have to work exclusively with Yuvoy?",
    answer: "No. Your existing customers and channels remain yours.",
  },
  {
    question: "What happens after I apply?",
    answer:
      "Someone from the Yuvoy team reads your application and contacts you to understand the experience and destination.",
  },
];
