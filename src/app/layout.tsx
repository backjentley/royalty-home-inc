import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Royalty Home Inc. | Premium Residential Renovations — Barrie & GTA",
  description: "Proudly Canadian. Flooring, painting, kitchens, bathrooms, and lighting. Premium residential renovations serving Barrie and the Greater Toronto Area.",
  openGraph: {
    title: "Royalty Home Inc. | Premium Renovations",
    description: "Crafted, not copied. Premium residential renovations in Barrie & the GTA.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
