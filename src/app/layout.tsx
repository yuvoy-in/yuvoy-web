import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fraunces, inter } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://yuvoy.com"),
  title: {
    default: "Yuvoy — Experience More.",
    template: "%s · Yuvoy",
  },
  description:
    "Don't be a tourist. Yuvoy designs immersive, participatory experiences in the Andaman Islands — so you belong to a place, briefly, rather than pass through it.",
  applicationName: "Yuvoy",
  openGraph: {
    type: "website",
    siteName: "Yuvoy",
    title: "Yuvoy — Experience More.",
    description:
      "Immersive, participatory experiences in the Andaman Islands. Don't be a tourist.",
    url: "https://yuvoy.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yuvoy — Experience More.",
    description: "Immersive experiences in the Andaman Islands.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
