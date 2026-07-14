import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://omamorisouvenir.id";

export const metadata: Metadata = {
  title: "Omamori Souvenir — Solusi Corporate Gift Premium",
  description: "Dari tumbler custom hingga employee onboarding kit lengkap. Zero inventory, mockup premium, dokumen lengkap. Melayani area Surabaya & Sidoarjo.",
  keywords: ["corporate gift", "souvenir perusahaan", "tumbler custom", "plakat", "lanyard", "goodie bag", "Surabaya", "Sidoarjo"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "64x64" },
      { url: "/logo.png", sizes: "520x680", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "Omamori Souvenir",
    title: "Omamori Souvenir — Solusi Corporate Gift Premium",
    description: "Dari tumbler custom hingga employee onboarding kit lengkap. Zero inventory, mockup premium, dokumen lengkap. Melayani area Surabaya & Sidoarjo.",
    images: [
      {
        url: "/hero-3d-product.png",
        width: 800,
        height: 600,
        alt: "Omamori Souvenir — Corporate Gift Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Omamori Souvenir — Solusi Corporate Gift Premium",
    description: "Dari tumbler custom hingga employee onboarding kit lengkap. Zero inventory, mockup premium, dokumen lengkap.",
    images: ["/hero-3d-product.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: "Omamori Souvenir",
    description: "Solusi corporate gift premium. Tumbler custom, plakat, lanyard, goodie bag, hardbox, dan starter kit untuk kebutuhan bisnis Anda.",
    url: SITE_URL,
    email: "info@omamorisouvenir.id",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Surabaya",
      addressRegion: "Jawa Timur",
      addressCountry: "ID",
    },
    areaServed: {
      "@type": "City",
      name: "Surabaya",
    },
    priceRange: "$$",
    image: `${SITE_URL}/logo.png`,
    sameAs: [
      "https://instagram.com/omamorisouvenir.id",
      "https://linkedin.com/company/omamorisouvenir",
    ],
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}