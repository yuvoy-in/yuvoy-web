import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Brand-styled Open Graph card (1200×630).
 *
 * Inline styles only: satori (behind next/og) supports a flexbox subset, not
 * Tailwind, and cannot resolve CSS custom properties. **This is the one place
 * in the codebase allowed to carry raw hex** — the values below are Brand Kit
 * v2 verbatim and must be updated with the tokens in globals.css.
 */
const OG = {
  cream: "#F4EFE4",
  teal: "#0D3B3E",
  terraDeep: "#985028",
  muted: "rgba(13,59,62,0.65)",
} as const;
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
        background: OG.cream,
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
          color: OG.terraDeep,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 68,
          lineHeight: 1.04,
          color: OG.teal,
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
            color: OG.teal,
          }}
        >
          <span style={{ display: "flex" }}>YUVOY</span>
          <span style={{ display: "flex", color: OG.terraDeep }}>.</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: OG.muted,
          }}
        >
          {footer}
        </div>
      </div>
    </div>,
    OG_SIZE,
  );
}
