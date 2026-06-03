import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import Script from "next/script";
import YandexMetrika from "@/components/YandexMetrika";
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
    "Контрактная служба РФ: достойные выплаты, боевые специальности, полное сопровождение от заявления до первых выплат. Служи Отечеству с честью.",
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
      <head>
        <GoogleAnalytics />

        {/* Yandex Metrika */}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {
                  if (document.scripts[j].src === r) { return; }
                }
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=109612757', 'ym');

              ym(109612757, 'init', {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                webvisor: true,
                ecommerce: "dataLayer",
                ssr: true,
                defer: true
              });
            `,
          }}
        />
      </head>

      <body className="min-h-screen bg-black text-white antialiased overflow-x-hidden select-none">
        <YandexMetrika />
        {children}
      </body>
    </html>
  );
}
