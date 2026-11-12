"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  QrCode,
  Terminal,
  Code2,
  CheckCircle2,
  ArrowRight,
  Cpu,
  Layers,
  Activity,
  Copy,
  Check,
} from "lucide-react";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const curlSnippet = `curl https://your-domain.vercel.app/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-aihub-your-key" \\
  -d '{
    "model": "anthropic/claude-3.5-sonnet",
    "messages": [{"role": "user", "content": "Viết mã Next.js chuẩn Clean Architecture"}]
  }'`;

  function copySnippet() {
    navigator.clipboard.writeText(curlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col min-h-screen bg-obsidian">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-24 px-4 sm:px-6 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-accent-cyan/15 to-accent-violet/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-surface border border-surface-border text-slate-300 mb-8 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span>Cổng API AI Đa Model Chuẩn OpenAI • Nạp VietQR Tự Động</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
              Dùng <span className="bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-emerald bg-clip-text text-transparent">Claude 3.5 & GPT-4o</span> <br className="hidden sm:inline" />
              Tại Việt Nam Bằng Tiền VNĐ
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Không cần thẻ Visa quốc tế, không lo bị khóa tài khoản. Nạp tiền ngân hàng quét mã QR 3 giây cộng tiền tức thì, cắm thẳng vào Cursor, Cline, LibreChat xài thả ga.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setAuthOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-black bg-gradient-to-r from-accent-cyan to-accent-violet hover:opacity-95 transition shadow-xl shadow-accent-cyan/15 group"
              >
                <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition" />
                <span>Nhận 10k Test Miễn Phí</span>
                <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition" />
              </button>

              <a
                href="#quickstart"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-slate-300 bg-surface border border-surface-border hover:text-white hover:border-slate-600 transition"
              >
                <Terminal className="w-4 h-4 text-accent-cyan" />
                <span>Cách Cắm Vào Cursor</span>
              </a>
            </div>

            {/* Quick Stat Bar */}
            <div className="mt-16 pt-8 border-t border-surface-border/60 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
              <div>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Hỗ trợ model</p>
                <p className="text-xl font-bold text-white mt-1">200+ Models</p>
              </div>
              <div>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Tốc độ nạp</p>
                <p className="text-xl font-bold text-accent-emerald mt-1">~3s VietQR</p>
              </div>
              <div>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Định dạng</p>
                <p className="text-xl font-bold text-accent-cyan mt-1">100% OpenAI</p>
              </div>
              <div>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Bảo vệ ví</p>
                <p className="text-xl font-bold text-accent-violet mt-1">Spending Limit</p>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID FEATURES */}
        <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Kiến Trúc Vận Hành Hoàn Hảo
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Mọi thứ được thiết kế tối ưu cho lập trình viên và người dùng AI tại Việt Nam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: VietQR Top-Up */}
            <div className="p-8 rounded-2xl bg-surface border border-surface-border bento-glow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald mb-6">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Nạp Tiền VietQR Tự Động 3s</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Quét mã QR từ bất kỳ app ngân hàng nào (Vietcombank, MB, Techcombank, MoMo). Webhook SePay bắt giao dịch và tự nhảy Credit sau 3 giây không cần admin duyệt.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-surface-border/60 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Webhook SePay IPN</span>
                <span className="text-accent-emerald">Tự động 24/7</span>
              </div>
            </div>

            {/* Bento Card 2: 100% OpenAI Format */}
            <div className="p-8 rounded-2xl bg-surface border border-surface-border bento-glow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan mb-6">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Chuẩn OpenAI API Proxy</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Endpoint <code className="text-accent-cyan bg-obsidian px-1.5 py-0.5 rounded">/v1/chat/completions</code> tương thích 100% với Cursor, Cline, LibreChat, NextChat. Chỉ cần đổi Base URL và dán API Key.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-surface-border/60 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>SSE Streaming</span>
                <span className="text-accent-cyan">Zero Latency</span>
              </div>
            </div>

            {/* Bento Card 3: Multi-Key Security */}
            <div className="p-8 rounded-2xl bg-surface border border-surface-border bento-glow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center text-accent-violet mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Đa API Key & Spending Limit</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Tạo nhiều API Key cho từng dự án, gắn hạn mức chi tiêu tối đa cho từng key. Lỡ lộ key ở đâu chỉ mất tối đa số tiền đã gán, ví chính được bảo vệ an toàn tuyệt đối.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-surface-border/60 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>SHA-256 Hash</span>
                <span className="text-accent-violet">An toàn tuyệt đối</span>
              </div>
            </div>
          </div>
        </section>

        {/* SUPPORTED MODELS & PRICING */}
        <section id="models" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-surface-border">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Bảng Giá Model Minh Bạch
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Tính tiền chính xác theo từng token bạn dùng, không ép mua gói tháng cố định.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Claude 3.5 Sonnet */}
            <div className="p-6 rounded-2xl bg-surface border border-accent-cyan/30 relative flex flex-col justify-between">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-accent-cyan text-black font-bold">
                PHỔ BIẾN NHẤT
              </div>
              <div>
                <span className="text-xs font-mono text-accent-cyan">Anthropic</span>
                <h3 className="text-lg font-bold text-white mt-1">Claude 3.5 Sonnet</h3>
                <p className="text-xs text-slate-400 mt-2">Vua lập trình code, viết văn, suy luận logic sắc bén nhất hiện nay.</p>
                <div className="mt-6 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span className="text-slate-400">Input:</span>
                    <span className="text-white">~105đ / 1K tokens</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span className="text-slate-400">Output:</span>
                    <span className="text-white">~525đ / 1K tokens</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAuthOpen(true)}
                className="mt-6 w-full py-2.5 rounded-xl text-xs font-semibold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan hover:text-black transition"
              >
                Dùng Claude Ngay
              </button>
            </div>

            {/* GPT-4o */}
            <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-accent-emerald">OpenAI</span>
                <h3 className="text-lg font-bold text-white mt-1">GPT-4o Omnimodel</h3>
                <p className="text-xs text-slate-400 mt-2">Cân bằng tuyệt vời giữa trí thông minh, tốc độ và khả năng phân tích đa phương tiện.</p>
                <div className="mt-6 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span className="text-slate-400">Input:</span>
                    <span className="text-white">~87đ / 1K tokens</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span className="text-slate-400">Output:</span>
                    <span className="text-white">~350đ / 1K tokens</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAuthOpen(true)}
                className="mt-6 w-full py-2.5 rounded-xl text-xs font-semibold bg-surface-subtle text-slate-300 border border-surface-border hover:border-slate-500 hover:text-white transition"
              >
                Dùng GPT-4o
              </button>
            </div>

            {/* DeepSeek V3 */}
            <div className="p-6 rounded-2xl bg-surface border border-accent-violet/30 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-accent-violet">DeepSeek</span>
                <h3 className="text-lg font-bold text-white mt-1">DeepSeek-V3</h3>
                <p className="text-xs text-slate-400 mt-2">Mô hình AI mã nguồn mở thông minh ngang ngửa Claude nhưng giá siêu hạt dẻ.</p>
                <div className="mt-6 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span className="text-slate-400">Input:</span>
                    <span className="text-accent-emerald font-bold">~5đ / 1K tokens</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span className="text-slate-400">Output:</span>
                    <span className="text-accent-emerald font-bold">~10đ / 1K tokens</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAuthOpen(true)}
                className="mt-6 w-full py-2.5 rounded-xl text-xs font-semibold bg-accent-violet/15 text-accent-violet border border-accent-violet/30 hover:bg-accent-violet hover:text-white transition"
              >
                Dùng DeepSeek V3
              </button>
            </div>

            {/* Gemini 2.0 Flash */}
            <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-accent-amber">Google</span>
                <h3 className="text-lg font-bold text-white mt-1">Gemini 2.0 Flash</h3>
                <p className="text-xs text-slate-400 mt-2">Tốc độ phản hồi cực nhanh, độ trễ cực thấp, phù hợp các tác vụ tự động hóa và chat bot.</p>
                <div className="mt-6 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span className="text-slate-400">Input:</span>
                    <span className="text-white">~3.5đ / 1K tokens</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-surface-border">
                    <span className="text-slate-400">Output:</span>
                    <span className="text-white">~14đ / 1K tokens</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAuthOpen(true)}
                className="mt-6 w-full py-2.5 rounded-xl text-xs font-semibold bg-surface-subtle text-slate-300 border border-surface-border hover:border-slate-500 hover:text-white transition"
              >
                Dùng Gemini 2.0
              </button>
            </div>
          </div>
        </section>

        {/* QUICKSTART SECTION */}
        <section id="quickstart" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-surface-border">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Tích Hợp Trong 30 Giây
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              Cắm vào Cursor, Cline (VSCode), LibreChat hoặc bất kỳ thư viện OpenAI SDK nào.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border bento-glow">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-border text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent-rose/80" />
                <span className="w-3 h-3 rounded-full bg-accent-amber/80" />
                <span className="w-3 h-3 rounded-full bg-accent-emerald/80" />
                <span className="ml-2 text-slate-500">cURL Example</span>
              </div>
              <button
                onClick={copySnippet}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-subtle border border-surface-border text-slate-300 hover:text-white transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Đã copy" : "Copy"}</span>
              </button>
            </div>
            <pre className="text-xs sm:text-sm font-mono text-accent-cyan overflow-x-auto p-2 leading-relaxed">
              <code>{curlSnippet}</code>
            </pre>
          </div>
        </section>
      </main>

      <Footer />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultMode="signup" />
    </div>
  );
}
