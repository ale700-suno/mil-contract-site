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
  },
  openGraph: {
    title: "CONTRACT RF",
    description: "Официальный сервис для подачи анкет и контрактов",
    images: [
      {
        url: "https://milcontract.vercel.app/og-image.jpg", // позже можешь добавить свою картинку
        width: 1200,
        height: 630,
      },
    ],
  },
  keywords: ["contract", "анкета", "контракт", "mil", "rf"],
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
