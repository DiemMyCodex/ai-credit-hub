"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import {
  Sparkles,
  ShieldCheck,
  QrCode,
  Terminal,
  Code2,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const curlSnippet = `curl https://ai-credit-hub-xnghii268-6342s-projects.vercel.app/v1/chat/completions \\
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
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Cổng API AI Đa Model Chuẩn OpenAI • Nạp VietQR Tự Động</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.15] mb-5">
              Dùng Claude 3.5 &amp; GPT-4o <br className="hidden sm:inline" />
              Tại Việt Nam Bằng Tiền VNĐ
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Không cần thẻ Visa quốc tế, không lo bị khóa tài khoản. Quét mã VietQR cộng credit sau 3 giây, cắm trực tiếp vào Cursor, Cline, LibreChat theo chuẩn OpenAI wire format.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setAuthOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-xs sm:text-sm text-zinc-950 bg-white hover:bg-zinc-200 transition shadow-sm active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                <span>Nhận 10k Test Miễn Phí</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
              </button>

              <a
                href="#quickstart"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-xs sm:text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 hover:text-white hover:bg-zinc-800 transition"
              >
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>Hướng dẫn cắm Cursor</span>
              </a>
            </div>

            {/* Quick Stat Bar */}
            <div className="mt-14 pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-left">
              <div>
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Hỗ trợ model</p>
                <p className="text-lg sm:text-xl font-semibold text-zinc-100 mt-1">200+ Models</p>
              </div>
              <div>
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Tốc độ nạp</p>
                <p className="text-lg sm:text-xl font-semibold text-zinc-100 mt-1">~3s VietQR</p>
              </div>
              <div>
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Định dạng</p>
                <p className="text-lg sm:text-xl font-semibold text-zinc-100 mt-1">100% OpenAI</p>
              </div>
              <div>
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Bảo vệ ví</p>
                <p className="text-lg sm:text-xl font-semibold text-zinc-100 mt-1">Spending Limit</p>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID FEATURES */}
        <section id="features" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-zinc-800/80">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              Kiến Trúc Tối Ưu Cho Lập Trình Viên
            </h2>
            <p className="text-zinc-400 mt-1.5 text-xs sm:text-sm">
              Đơn giản, tin cậy, không rườm rà.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Bento Card 1: VietQR Top-Up */}
            <div className="p-5 sm:p-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700/80 transition">
              <div>
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 mb-4">
                  <QrCode className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-1.5">Nạp Tiền VietQR Tự Động 3s</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Quét mã QR từ bất kỳ app ngân hàng nào (Vietcombank, MB, Techcombank, MoMo). Webhook SePay khớp đơn và tự động cộng Credit sau 3 giây.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Webhook SePay IPN</span>
                <span className="text-emerald-400">Tự động 24/7</span>
              </div>
            </div>

            {/* Bento Card 2: 100% OpenAI Format */}
            <div className="p-5 sm:p-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700/80 transition">
              <div>
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 mb-4">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-1.5">Chuẩn OpenAI API Proxy</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Endpoint <code className="text-zinc-200 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">/v1/chat/completions</code> tương thích 100% với Cursor, Cline, LibreChat, NextChat.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>SSE Streaming</span>
                <span className="text-zinc-300">Zero Latency</span>
              </div>
            </div>

            {/* Bento Card 3: Multi-Key Security */}
            <div className="p-5 sm:p-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700/80 transition">
              <div>
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 mb-4">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-1.5">Đa API Key &amp; Spending Limit</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Tạo nhiều API Key cho từng dự án, gắn hạn mức chi tiêu trần. Khóa tự động dừng khi vượt ngưỡng, bảo vệ số dư tài khoản của bạn.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>SHA-256 Hash</span>
                <span className="text-zinc-300">An toàn tuyệt đối</span>
              </div>
            </div>
          </div>
        </section>

        {/* SUPPORTED MODELS & PRICING */}
        <section id="models" className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-zinc-800/80">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              Bảng Giá Model Minh Bạch
            </h2>
            <p className="text-zinc-400 mt-1.5 text-xs sm:text-sm">
              Tính tiền chính xác theo từng token thực tế, không bắt mua gói cố định.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Claude 3.5 Sonnet */}
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-700/80 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-zinc-400">Anthropic</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                    Phổ biến
                  </span>
                </div>
                <h3 className="text-base font-semibold text-zinc-100">Claude 3.5 Sonnet</h3>
                <p className="text-xs text-zinc-400 mt-1.5">Lập trình code, suy luận và viết kiến trúc hàng đầu.</p>
                <div className="mt-5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Input:</span>
                    <span className="text-zinc-200">~105đ / 1K tokens</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Output:</span>
                    <span className="text-zinc-200">~525đ / 1K tokens</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAuthOpen(true)}
                className="mt-5 w-full py-2 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-sm active:scale-[0.98]"
              >
                Dùng Claude Ngay
              </button>
            </div>

            {/* GPT-4o */}
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700/80 transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-zinc-400">OpenAI</span>
                </div>
                <h3 className="text-base font-semibold text-zinc-100">GPT-4o Omnimodel</h3>
                <p className="text-xs text-zinc-400 mt-1.5">Trí thông minh đa nhiệm, nhanh và phân tích dữ liệu tốt.</p>
                <div className="mt-5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Input:</span>
                    <span className="text-zinc-200">~87đ / 1K tokens</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Output:</span>
                    <span className="text-zinc-200">~350đ / 1K tokens</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAuthOpen(true)}
                className="mt-5 w-full py-2 rounded-lg text-xs font-medium bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition"
              >
                Dùng GPT-4o
              </button>
            </div>

            {/* DeepSeek V3 */}
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700/80 transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-zinc-400">DeepSeek</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Siêu rẻ
                  </span>
                </div>
                <h3 className="text-base font-semibold text-zinc-100">DeepSeek-V3</h3>
                <p className="text-xs text-zinc-400 mt-1.5">Model AI thông minh tương đương Claude với mức phí cực rẻ.</p>
                <div className="mt-5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Input:</span>
                    <span className="text-emerald-400 font-semibold">~5đ / 1K tokens</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Output:</span>
                    <span className="text-emerald-400 font-semibold">~10đ / 1K tokens</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAuthOpen(true)}
                className="mt-5 w-full py-2 rounded-lg text-xs font-medium bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition"
              >
                Dùng DeepSeek V3
              </button>
            </div>

            {/* Gemini 2.0 Flash */}
            <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700/80 transition">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-zinc-400">Google</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Siêu tốc
                  </span>
                </div>
                <h3 className="text-base font-semibold text-zinc-100">Gemini 2.0 Flash</h3>
                <p className="text-xs text-zinc-400 mt-1.5">Tốc độ phản hồi cực nhanh, độ trễ thấp cho automation.</p>
                <div className="mt-5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Input:</span>
                    <span className="text-zinc-200">~3.5đ / 1K tokens</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Output:</span>
                    <span className="text-zinc-200">~14đ / 1K tokens</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAuthOpen(true)}
                className="mt-5 w-full py-2 rounded-lg text-xs font-medium bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition"
              >
                Dùng Gemini 2.0
              </button>
            </div>
          </div>
        </section>

        {/* QUICKSTART SECTION */}
        <section id="quickstart" className="py-16 px-4 sm:px-6 max-w-4xl mx-auto border-t border-zinc-800/80">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              Tích Hợp Trong 30 Giây
            </h2>
            <p className="text-zinc-400 mt-1.5 text-xs sm:text-sm">
              Tương thích mọi client và SDK hỗ trợ OpenAI API.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
              <span className="text-zinc-300">cURL Example</span>
              <button
                onClick={copySnippet}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Đã copy" : "Copy"}</span>
              </button>
            </div>
            <pre className="text-xs sm:text-sm font-mono text-zinc-300 overflow-x-auto p-2 leading-relaxed">
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
