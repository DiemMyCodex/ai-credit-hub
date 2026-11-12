import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-zinc-500 text-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
            <Sparkles className="w-3 h-3 text-zinc-400" />
          </div>
          <span className="font-medium text-zinc-200">AI Credit Hub</span>
          <span>• Tối ưu cho Vercel &amp; Supabase</span>
        </div>

        <div className="flex items-center gap-5 text-zinc-500">
          <span>Chuẩn OpenAI API</span>
          <span>VietQR SePay 24/7</span>
        </div>
      </div>
    </footer>
  );
}
