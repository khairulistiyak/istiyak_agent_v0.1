import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://istiyak.ai'),
  title: "ISTIYAK AI Companion — Floating Autonomous AI Software Engineer",
  description: "A lightning-fast, floating desktop AI software engineer that lives alongside your editor and writes, debugs, and runs code autonomously.",
  openGraph: {
    title: "ISTIYAK AI Companion",
    description: "Autonomous AI coding assistant for developers. Free tier + Pro plan.",
    url: "https://istiyak.ai",
    siteName: "ISTIYAK AI Companion",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "ISTIYAK AI Companion - Autonomous AI Software Engineer",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ISTIYAK AI Companion",
    description: "Autonomous AI coding assistant for developers.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#030712", color: "#f3f4f6" }}>
        {children}
      </body>
    </html>
  );
}
