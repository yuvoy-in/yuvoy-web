import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "How Yuvoy will work";

export default function Image() {
  return renderOg({
    eyebrow: "How it works",
    title: "Two audiences. Two separate journeys.",
    footer: "Experience more.",
  });
}
