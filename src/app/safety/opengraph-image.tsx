import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Where Yuvoy stands on safety";

export default function Image() {
  return renderOg({
    eyebrow: "Trust & safety",
    title: "Clear expectations before every experience.",
    footer: "Experience more.",
  });
}
