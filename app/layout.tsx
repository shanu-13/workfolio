import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "R.A. Shankari — Frontend Developer",
  description: "R.A. Shankari — frontend developer building fast, responsive websites with React, Next.js and Tailwind CSS. 60+ websites shipped.",
};

// Fonts load from Google Fonts directly; next/font/google fails in Turbopack dev mode.
const fonts =
  "https://fonts.googleapis.com/css2?family=Bangers&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;700&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="race">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={fonts} />
      </head>
      <body>{children}</body>
    </html>
  );
}
