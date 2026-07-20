import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "라방바 데이터랩 · 방송 랭킹",
  description: "라이브 방송 / 홈쇼핑 방송 랭킹 리스트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
