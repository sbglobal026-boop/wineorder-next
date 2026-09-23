import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Schibsted_Grotesk } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { Lato } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { organizationJsonLd } from "@/lib/seo";
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

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
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
  // 페이지마다 제목을 따로 주면 "상품명 | table code" 형태로 조합됨
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | 유럽 와인 직배송`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ko_KR',
    url: SITE_URL,
    title: `${SITE_NAME} | 유럽 와인 직배송`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  // 네이버 서치어드바이저 사이트 소유확인용 태그 (공개용 확인 값)
  verification: { other: { 'naver-site-verification': 'e253286db77ce9a3ed1e4029a6c109509aa9b652' } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 영문 폰트 변수에 나눔스퀘어를 폴백으로 추가 → 영문은 원래 폰트, 한글은 전부 나눔스퀘어로 표시
  const fontVars = {
    "--font-geist-sans": `${geist.style.fontFamily}, ${nanumSquare.style.fontFamily}`,
    "--font-grotesk": `${grotesk.style.fontFamily}, ${nanumSquare.style.fontFamily}`,
    "--font-playfair-display": `${playfairDisplay.style.fontFamily}, ${nanumSquare.style.fontFamily}`,
    "--font-lato": `${lato.style.fontFamily}, ${nanumSquare.style.fontFamily}`,
  } as React.CSSProperties;

  return (
    <html lang="ko" className={`${geist.variable} ${grotesk.variable} ${playfairDisplay.variable} ${lato.variable} ${nanumSquare.variable} h-full antialiased`} style={fontVars}>
      <body className="min-h-full bg-[#F9F4EE] font-korean">
        {/* 검색엔진에 사이트 기본 정보 제공 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
