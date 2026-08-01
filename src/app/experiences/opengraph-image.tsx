import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Experiences on Yuvoy";

export default function Image() {
  return renderOg({
    eyebrow: "Experiences",
    title: "Four kinds of day, curated one island at a time.",
    footer: "Experience more.",
  });
}
