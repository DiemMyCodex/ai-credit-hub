import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Credit Hub - Cổng API AI Đa Model & Nạp Tiền VietQR",
  description: "Cung cấp API Key tương thích OpenAI cho Claude 3.5 Sonnet, GPT-4o, DeepSeek-V3. Nạp tiền tự động qua VietQR trong 3 giây.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-obsidian text-slate-100 min-h-screen antialiased selection:bg-accent-cyan/20 selection:text-accent-cyan">
        {children}
      </body>
    </html>
  );
}
