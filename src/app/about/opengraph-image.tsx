import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "About Yuvoy";

export default function Image() {
  return renderOg({
    eyebrow: "About",
    title: "Built to help people experience more of a place.",
    footer: "Experience more.",
  });
}
