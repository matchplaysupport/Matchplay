import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Match Play — Golf Tee Times, Your Way",
  description:
    "Book tee times at top courses, compete with friends, and manage your golf club — all in one place. Match Play connects golfers and courses.",
  openGraph: {
    title: "Match Play — Golf Tee Times, Your Way",
    description:
      "Book tee times at top courses, compete with friends, and manage your golf club — all in one place.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-[var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
