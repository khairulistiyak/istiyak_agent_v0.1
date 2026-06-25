import React from "react";
import "./globals.css";

export const metadata = {
  title: "ISTIYAK AI Companion — Floating Autonomous AI Software Engineer",
  description: "A lightning-fast, floating desktop AI software engineer that lives alongside your editor and writes, debugs, and runs code autonomously.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
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
