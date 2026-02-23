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
    title: "Royalty Home Inc. | Crafted, Not Copied.",
    description: "Premium residential renovations in Barrie & the GTA. Built to a standard, not a price point.",
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
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
      </head>
      <body className={`${inter.variable} font-sans antialiased text-charcoal bg-ivory tracking-tight`}>
        {children}
      </body>
    </html>
  );
}
