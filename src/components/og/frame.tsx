import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Brand-styled Open Graph card (1200×630). Uses inline styles only — satori
 * (behind next/og) supports a flexbox subset, not Tailwind. Default font.
 */
export function renderOg({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string;
  title: string;
  footer: string;
}) {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#F5F2EC",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 26,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#8F4522",
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 92,
          lineHeight: 1.04,
          color: "#0F4C5C",
          maxWidth: 980,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: "0.34em",
            color: "#0F4C5C",
          }}
        >
          <span style={{ display: "flex" }}>YUVOY</span>
          <span style={{ display: "flex", color: "#8F4522" }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "rgba(31,58,53,0.55)",
          }}
        >
          {footer}
        </div>
      </div>
    </div>,
    OG_SIZE,
  );
}
