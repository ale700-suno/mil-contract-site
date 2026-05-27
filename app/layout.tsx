import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CONTRACT RF",
  description: "Подача анкет и контрактов | Contract RF",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "CONTRACT RF",
    description: "Подача анкет и контрактов | Contract RF",
    siteName: "CONTRACT RF",
    url: "https://milcontract.vercel.app",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "https://milcontract.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CONTRACT RF - Подача анкет",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CONTRACT RF",
    description: "Подача анкет и контрактов | Contract RF",
    images: ["https://milcontract.vercel.app/og-image.jpg"],
  },
  keywords: ["contract", "анкета", "контракт", "mil", "rf", "россия", "контракт рф"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-black text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
