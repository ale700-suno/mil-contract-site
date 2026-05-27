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
    icon: "/favicon.ico",           // Основная иконка (флаг РФ)
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",       // Для iOS
    other: {
      rel: "apple-touch-icon",
      url: "/apple-icon.png",
    },
  },
  openGraph: {
    title: "CONTRACT RF",
    description: "Официальный сервис для подачи анкет и контрактов",
    images: [
      {
        url: "https://milcontract.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CONTRACT RF",
      },
    ],
    siteName: "CONTRACT RF",
  },
  keywords: ["contract", "анкета", "контракт", "mil", "rf", "россия"],
  authors: [{ name: "CONTRACT RF" }],
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
