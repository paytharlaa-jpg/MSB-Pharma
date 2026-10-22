import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSB PHARMACHEM — Quality Products, Global Supply | Pharmaceutical APIs & Intermediates",
  description:
    "Trusted supplier of Active Pharmaceutical Ingredients (APIs), Bulk Drugs, Pharma Raw Materials, Excipients, Chemicals, Solvents and Impurity Standards based in Kukatpally, Hyderabad, India.",
  keywords: [
    "MSB PHARMACHEM",
    "Pharmaceutical APIs Hyderabad",
    "Bulk Drugs India",
    "Pharma Raw Materials",
    "Excipients",
    "Impurity Standards",
    "Atorvastatin Calcium API",
    "Montelukast Sodium",
    "Chemical Trading Hyderabad",
  ],
  authors: [{ name: "MSB PHARMACHEM" }],
  creator: "MSB PHARMACHEM",
  metadataBase: new URL("https://msbpharmachem.com"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://msbpharmachem.com",
    title: "MSB PHARMACHEM — Quality Products, Global Supply",
    description:
      "Pharmaceutical APIs, Bulk Drugs, Raw Materials, Excipients & Impurity Standards from Hyderabad to global markets.",
    siteName: "MSB PHARMACHEM",
    images: [
      {
        url: "/images/hero-scientific-background.webp",
        width: 1200,
        height: 630,
        alt: "MSB PHARMACHEM - Global Pharma Supply",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1F33",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
