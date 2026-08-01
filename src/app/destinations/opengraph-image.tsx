import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Yuvoy destinations";

export default function Image() {
  return renderOg({
    eyebrow: "Destinations",
    title: "One market, covered properly.",
    footer: "Experience more.",
  });
}
