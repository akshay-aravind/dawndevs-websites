import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const SITE_URL = "https://dawndevs.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DawnDevs — website studio",
  description:
    "A studio that builds one thing, beautifully: websites. Three clear ways to work together — Starter, Custom, and Signature.",
  keywords: [
    "website design",
    "website development",
    "web studio",
    "custom website",
    "DawnDevs",
  ],
  openGraph: {
    title: "DawnDevs — website studio",
    description: "We build one thing, beautifully: websites.",
    url: SITE_URL,
    siteName: "DawnDevs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DawnDevs — website studio",
    description: "We build one thing, beautifully: websites.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
