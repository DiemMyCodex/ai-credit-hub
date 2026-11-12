import { Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-obsidian-300 py-12 text-slate-500 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-cyan to-brand-violet text-obsidian font-bold">
            <Sparkles className="w-3.5 h-3.5 text-obsidian" />
          </div>
          <span className="font-semibold text-slate-200">AI Credit Hub</span>
          <span>• Tối ưu cho Vercel & Supabase</span>
        </div>

        <div className="flex items-center gap-6">
          <span>Tương thích 100% định dạng OpenAI</span>
          <span>Thanh toán VietQR tự động 24/7</span>
        </div>
      </div>
    </footer>
  );
}
