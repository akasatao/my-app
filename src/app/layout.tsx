import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private Lounge",
  description: "招待コードを持つ人だけが参加できるクローズドラウンジ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
