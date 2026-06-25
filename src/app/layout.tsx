import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Schibsted_Grotesk } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Open_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const grotesk = Schibsted_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nanumSquare = localFont({
  variable: "--font-nanum-square",
  src: [
    { path: "../fonts/nanum-square/NanumSquareL.woff2", weight: "300", style: "normal" },
    { path: "../fonts/nanum-square/NanumSquareR.woff2", weight: "400", style: "normal" },
    { path: "../fonts/nanum-square/NanumSquareB.woff2", weight: "700", style: "normal" },
    { path: "../fonts/nanum-square/NanumSquareEB.woff2", weight: "800", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "table code | 프리미엄 와인 쇼핑몰",
  description: "엄선된 세계 각국의 와인을 합리적인 가격에 만나보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} ${grotesk.variable} ${playfairDisplay.variable} ${openSans.variable} ${nanumSquare.variable} h-full antialiased`}>
      <body className="min-h-full bg-white font-korean">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
