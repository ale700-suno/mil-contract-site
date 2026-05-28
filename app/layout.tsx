import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://mil-contract-rf.vercel.app";

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
  metadataBase: new URL(siteUrl),
  title: {
    default: "Контрактная служба РФ — военный контракт",
    template: "%s | Контрактная служба РФ 🇷🇺",
  },
  description:
    "Оформление военного контракта: выплаты, должности, полное сопровождение и консультация 24/7.",
  applicationName: "Контрактная служба РФ",
  authors: [{ name: "Контрактная служба РФ" }],
  creator: "Контрактная служба РФ",
  publisher: "Контрактная служба РФ",
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Контрактная служба РФ",
    title: "Контрактная служба РФ — военный контракт",
    description:
      "Военный контракт: выплаты, должности, сопровождение на всех этапах оформления.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Контрактная служба РФ — военный контракт",
    description:
      "Военный контракт: выплаты, должности, сопровождение 24/7.",
  },
  keywords: [
    "военный контракт",
    "контрактная служба",
    "контракт РФ",
    "выплаты контракт",
    "оформление контракта",
    "армия контракт",
  ],
  alternates: {
    canonical: siteUrl,
  },
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
      <body className="min-h-screen bg-black text-white antialiased overflow-x-hidden select-none">
        {children}
      </body>
    </html>
  );
}
