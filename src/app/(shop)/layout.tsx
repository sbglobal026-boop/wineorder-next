import ShopChrome from "@/components/layout/ShopChrome";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 헤더/푸터 표시 여부는 경로에 따라 ShopChrome(클라이언트)에서 결정 — 홈에서는 숨김
  return <ShopChrome>{children}</ShopChrome>;
}
