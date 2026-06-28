import type { Metadata } from "next";
import { Inter, Sora, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://matchplay.golf";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Match Play — Book Tee Times. Keep the Score. Zero Commission.",
    template: "%s · Match Play",
  },
  description:
    "Match Play connects golfers to tee times at their favourite courses and gives operators a zero-commission booking platform. Search, book, and play — with match-play scoring, handicaps, and leaderboards built in.",
  keywords: [
    "golf tee times", "tee time booking", "golf course software", "zero commission tee times",
    "match play scoring", "golf handicap app", "tee sheet management", "golf marketplace",
  ],
  authors: [{ name: "Match Play" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Match Play — Book Tee Times. Keep the Score.",
    description:
      "The zero-commission booking platform for modern golf. Find a tee time in seconds, track your match, and never leave a slot empty.",
    url: SITE_URL,
    siteName: "Match Play",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Match Play — Book Tee Times. Keep the Score.",
    description:
      "The zero-commission booking platform for modern golf. Find a tee time in seconds, track your match, and never leave a slot empty.",
  },
  robots: { index: true, follow: true },
  category: "sports",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Match Play",
      url: SITE_URL,
      description: "Zero-commission golf tee-time booking and match-play scoring platform.",
    },
    {
      "@type": "SoftwareApplication",
      name: "Match Play",
      applicationCategory: "SportsApplication",
      operatingSystem: "iOS, Android",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description:
        "Search and book tee times, track match-play and stroke-play scoring, manage your handicap, and compete on leaderboards.",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
