import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Explore experiences and destinations on Yuvoy";

export default function Image() {
  return renderOg({
    eyebrow: "Explore",
    title: "Find real experiences, wherever you are going.",
    footer: "Experience more.",
  });
}
