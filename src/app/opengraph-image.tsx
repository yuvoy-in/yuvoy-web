import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Yuvoy — See the experience. Feel if it's right. Then book.";

export default function Image() {
  return renderOg({
    eyebrow: "Opening first in the Andaman Islands",
    title: "See the experience. Feel if it's right. Then book.",
    footer: "Experience more.",
  });
}
