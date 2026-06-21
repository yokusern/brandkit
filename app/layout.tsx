import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandKit AI — ブランドアイデンティティを10秒で生成",
  description: "ブランド名と業種を入れるだけでカラーパレット・フォント・タグライン・ブランドストーリーをAIが即生成。",
  keywords: ["ブランドアイデンティティ", "カラーパレット", "ロゴ", "ブランディング", "AI", "副業", "スタートアップ"],
  openGraph: {
    title: "BrandKit AI — ブランドアイデンティティを10秒で生成",
    description: "カラーパレット・フォント・タグライン・ブランドストーリーをAIが即生成。",
    url: "https://brandkit-ai.vercel.app",
    siteName: "BrandKit AI",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@Yoko_ai_dev",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-white min-h-screen">{children}</body>
    </html>
  );
}
