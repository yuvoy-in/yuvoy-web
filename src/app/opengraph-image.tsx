import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from "@/components/og/frame";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Yuvoy — Don't be a tourist.";

export default function Image() {
  return renderOg({
    eyebrow: "Starting in the Andamans · This season",
    title: "Don't be a tourist.",
    footer: "Building for the world.",
  });
}
