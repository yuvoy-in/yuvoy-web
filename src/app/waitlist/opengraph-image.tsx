import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Join the Yuvoy waitlist";

export default function Image() {
  return renderOg({
    eyebrow: "Get first access",
    title: "Join the waitlist.",
    footer: "Experience more.",
  });
}
