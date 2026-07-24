import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Yuvoy — Experience More.";

export default function Image() {
  return renderOg({
    eyebrow: "Havelock · Andaman Islands",
    title: "Don't be a tourist.",
    footer: "Experience More.",
  });
}
