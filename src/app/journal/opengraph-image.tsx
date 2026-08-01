import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "The Yuvoy journal";

export default function Image() {
  return renderOg({
    eyebrow: "Journal",
    title: "Field notes from the build.",
    footer: "Experience more.",
  });
}
