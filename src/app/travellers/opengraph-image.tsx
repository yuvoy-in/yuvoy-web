import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Yuvoy for travellers";

export default function Image() {
  return renderOg({
    eyebrow: "For travellers",
    title: "Know what you are getting before you are on the boat.",
    footer: "Experience more.",
  });
}
