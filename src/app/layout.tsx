import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Body text uses the system font stack (see --font-system in globals.css).
// The mono face only appears on a few pages (order and tracking numbers),
// so it is fetched when used instead of being preloaded on every page.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const SITE_URL = "https://omamorisouvenir.my.id";

const SITE_TITLE = "Omamori Souvenir — Corporate Gift & Welcome Kit";
const SITE_DESCRIPTION = "Welcome kit karyawan baru dan souvenir korporat untuk perusahaan di Surabaya, Sidoarjo, dan Pasuruan.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: ["welcome kit karyawan baru", "corporate gift", "souvenir perusahaan", "tumbler custom", "plakat", "lanyard", "goodie bag", "Surabaya", "Sidoarjo", "Pasuruan"],
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
    url: "/",
    siteName: "Omamori Souvenir",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        // Ganti dengan foto sampel nyata (1200x630) begitu tersedia
        url: "/hero-3d-product.png",
        width: 1344,
        height: 768,
        alt: "Omamori Souvenir — Corporate Gift & Welcome Kit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
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
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    email: "omamori@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Surabaya",
      addressRegion: "Jawa Timur",
      addressCountry: "ID",
    },
    areaServed: [
      { "@type": "City", name: "Surabaya" },
      { "@type": "City", name: "Sidoarjo" },
      { "@type": "City", name: "Pasuruan" },
    ],
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
        className={`${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}