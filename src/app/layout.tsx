import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Schibsted_Grotesk } from "next/font/google";
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
    <html lang="ko" className={`${geist.variable} ${grotesk.variable} h-full antialiased`}>
      <body className="min-h-full bg-white font-grotesk">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
