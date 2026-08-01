import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Yuvoy for operators";

export default function Image() {
  return renderOg({
    eyebrow: "For operators",
    title: "Show what you run, properly.",
    footer: "Experience more.",
  });
}
