import type { Metadata } from "next";
import { Geist, Geist_Mono, MuseoModerno } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const museoModerno = MuseoModerno({
  variable: "--font-museo-moderno",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://convertkaro.com'), // Set your actual domain here
  title: "ConvertKaro - Free Online Image Format Converter | PNG to WebP, JPEG & More",
  description: "Transform your images with ConvertKaro - the fastest free online image converter. Convert PNG to WebP, JPEG, GIF, BMP and all popular formats instantly. Maintain stunning quality while reducing file sizes by up to 80%.",
  keywords: [
    "image converter",
    "png to webp",
    "jpeg converter",
    "webp converter",
    "image compression",
    "format converter",
    "free image converter",
    "online converter",
    "image optimization",
    "file size reducer"
  ],
  authors: [{ name: "ConvertKaro" }],
  creator: "ConvertKaro",
  publisher: "ConvertKaro",
  
  // Open Graph
  openGraph: {
    title: "ConvertKaro - Free Online Image Format Converter",
    description: "Transform your images with lightning speed. Convert PNG to WebP, JPEG, GIF, BMP and all popular formats while maintaining stunning quality.",
    type: "website",
    locale: "en_US",
    siteName: "ConvertKaro",
    images: [
      {
        url: "/Logo.webp",
        width: 1200,
        height: 630,
        alt: "ConvertKaro - Free Online Image Converter",
        type: "image/webp",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "ConvertKaro - Free Online Image Format Converter",
    description: "Transform your images with lightning speed. Convert PNG to WebP, JPEG & more while maintaining stunning quality.",
    images: ["/Logo.webp"],
    creator: "@convertkaro",
    site: "@convertkaro",
  },
  
  // Additional Meta Tags
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification tags (you can add these when you set up Google Search Console, etc.)
  verification: {
    // google: "your-google-site-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  
  // App-specific
  applicationName: "ConvertKaro",
  category: "Image Tools",
  
  // Icons and manifest
  icons: {
    icon: [
      { url: "/Logo.webp", sizes: "any", type: "image/webp" },
      { url: "/Logo.webp", sizes: "32x32", type: "image/webp" },
      { url: "/Logo.webp", sizes: "16x16", type: "image/webp" },
    ],
    shortcut: "/Logo.webp",
    apple: [
      { url: "/Logo.webp", sizes: "180x180", type: "image/webp" },
      { url: "/Logo.webp", sizes: "152x152", type: "image/webp" },
      { url: "/Logo.webp", sizes: "144x144", type: "image/webp" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/Logo.webp",
        color: "#FF3131",
      },
      {
        rel: "icon",
        type: "image/webp",
        url: "/Logo.webp",
      },
    ],
  },
  
  // Additional metadata
  formatDetection: {
    telephone: false,
  },
  
  // Alternate languages (add more as needed)
  alternates: {
    canonical: "https://convertkaro.com", // Update with your actual domain
    languages: {
      "en-US": "https://convertkaro.com",
      // Add more language versions if available
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ConvertKaro",
    "description": "Free online image format converter. Convert PNG to WebP, JPEG, GIF, BMP and all popular formats instantly while maintaining quality.",
    "url": "https://convertkaro.com",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Convert PNG to WebP",
      "Convert JPEG to WebP",
      "Convert GIF to WebP",
      "Convert BMP to PNG",
      "Convert TIFF to JPEG",
      "Batch image conversion",
      "Drag and drop interface",
      "No file size limits",
      "Privacy-focused (client-side processing)",
      "Download individual files or ZIP archives"
    ],
    "screenshot": "https://convertkaro.com/Logo.webp",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "ConvertKaro"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ConvertKaro",
      "logo": {
        "@type": "ImageObject",
        "url": "https://convertkaro.com/Logo.webp"
      }
    },
    "softwareRequirements": "Web Browser with JavaScript enabled",
    "browserRequirements": "Modern web browser (Chrome, Firefox, Safari, Edge)",
    "permissions": "No special permissions required",
    "isAccessibleForFree": true,
    "usageInfo": "https://convertkaro.com",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "Image Format Converter",
      "applicationCategory": "Image Processing Tool",
      "description": "Convert images between various formats including PNG, WebP, JPEG, GIF, and BMP with high quality preservation."
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${museoModerno.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
