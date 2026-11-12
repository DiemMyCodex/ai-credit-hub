import { Check, Copy, Code2 } from "lucide-react";
import { useState } from "react";

export function QuickstartCursor() {
  const [copied, setCopied] = useState(false);

  const configText = `{
  "models": [
    {
      "model": "anthropic/claude-3.5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "baseUrl": "https://your-domain.vercel.app/v1",
      "apiKey": "sk-aihub-your-generated-key"
    }
  ]
}`;

  const copyConfig = () => {
    navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="quickstart" className="py-20 border-t border-white/5 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 rounded-full mb-3">
              Cài Đặt 30 Giây
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Cắm Vào Cursor Hoặc IDE Dễ Dàng Như Trở Bàn Tay
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Bạn không cần cài phần mềm phức tạp hay fake IP. Trong Cursor Settings &gt; Models, bật OpenAI API Key, nhập <code className="text-brand-cyan bg-white/5 px-1 py-0.5 rounded font-mono">Override OpenAI Base URL</code> là domain của bạn và dán API Key được cấp.
            </p>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-bold">1</div>
                <span>Tạo tài khoản và nạp số dư tối thiểu 50,000đ qua VietQR.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-bold">2</div>
                <span>Tạo một API Key mới trong Dashboard cá nhân.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-bold">3</div>
                <span>Dán Base URL và Key vào Cursor, Cline hoặc NextChat. Xong!</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-surface-card p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Code2 className="w-4 h-4 text-brand-cyan" />
                <span>cursor-config.json</span>
              </div>
              <button
                onClick={copyConfig}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Đã copy" : "Copy"}</span>
              </button>
            </div>
            <pre className="text-slate-300 overflow-x-auto leading-relaxed">
              <code>{configText}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
