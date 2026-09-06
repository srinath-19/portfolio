import type { Metadata } from "next";
import { Anton, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * All three are self-hosted: `next/font` downloads them at build time and
 * emits them as static assets, so the browser never talks to Google and there
 * is no swap-in flash. Nothing here needs a CDN at runtime.
 *
 * Anton replaces the bare `Impact` stack the display type used to rely on —
 * Impact ships on Windows and macOS but not on Linux or Android, where the
 * headings were silently falling back to a generic bold sans.
 */
const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
