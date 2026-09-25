import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "招待制なんでも実況板",
  description: "招待コードを知っている人だけが参加できる掲示板",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full bg-[#eff3f8] text-black">{children}</body>
    </html>
  );
}
