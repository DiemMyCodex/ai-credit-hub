import { QrCode, Terminal, ShieldCheck, Zap, Activity, Globe } from "lucide-react";

export function BentoGridFeatures() {
  return (
    <section id="features" className="py-20 border-t border-white/5 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-violet bg-brand-violet/10 border border-brand-violet/20 rounded-full mb-3">
            Hạ Tầng Tối Tân
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Được Thiết Kế Riêng Cho Developer Việt Nam
          </h2>
          <p className="text-slate-400 text-sm">
            Tất cả những gì bạn cần để thoải mái dùng AI cao cấp mà không lo bị chặn thẻ Visa hay tài khoản bị khóa vô cớ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: VietQR Auto */}
          <div className="md:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-surface-card to-obsidian-200 p-8 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-cyan/20 transition-all duration-500" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan mb-6">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Nạp Tiền VietQR Tự Động 3 Giây
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-lg mb-6">
              Mở app ngân hàng bất kỳ (MB, VCB, Techcombank, VPBank...) quét mã VietQR động. Hệ thống kết nối webhook SePay tự động khớp giao dịch và cộng Credit vào tài khoản ngay lập tức mà không cần chờ người duyệt.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                24/7 Realtime
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                Tối thiểu chỉ từ 50,000đ
              </span>
            </div>
          </div>

          {/* Card 2: OpenAI Compatible */}
          <div className="rounded-3xl border border-white/10 bg-surface-card p-8 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-violet/10 border border-brand-violet/30 text-brand-violet mb-6">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                100% Chuẩn OpenAI
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Chỉ cần thay đổi <code className="text-brand-cyan bg-white/5 px-1 py-0.5 rounded">baseURL</code> thành endpoint của chúng tôi và dán API Key. Chạy mượt mà trên Cursor, LibreChat, Cline, NextChat, Dify.
              </p>
            </div>
            <div className="font-mono text-[11px] bg-obsidian-300 border border-white/5 rounded-xl p-3 text-slate-400">
              <span className="text-brand-cyan">baseURL</span>: https://aihub.vn/v1
            </div>
          </div>

          {/* Card 3: Key Safety */}
          <div className="rounded-3xl border border-white/10 bg-surface-card p-8 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-brand-emerald mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Giới Hạn Chi Tiêu (Limit)
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Tạo nhiều API Key cho từng dự án, gán hạn mức trần (spending limit) riêng biệt. Lỡ làm lộ key trên GitHub cũng không bao giờ bị cháy tài khoản chính.
              </p>
            </div>
            <div className="text-xs text-brand-emerald font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
              Mã hóa một chiều SHA-256
            </div>
          </div>

          {/* Card 4: Low Latency */}
          <div className="md:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-tr from-surface-card to-obsidian-200 p-8 flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-brand-amber mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Stream SSE Không Buffer & Tốc Độ Siêu Tốc
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl mb-6">
                Hạ tầng Edge/Serverless proxy truyền trực tiếp từng chunk token về máy tính của bạn với độ trễ thấp nhất. Không lưu prompt người dùng vào bộ nhớ đệm, đảm bảo bảo mật mã nguồn tối đa.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4 text-center">
              <div>
                <div className="text-xl font-bold text-white">~35ms</div>
                <div className="text-[11px] text-slate-500">Độ trễ TTFT proxy</div>
              </div>
              <div>
                <div className="text-xl font-bold text-brand-cyan">200+</div>
                <div className="text-[11px] text-slate-500">Models hàng đầu</div>
              </div>
              <div>
                <div className="text-xl font-bold text-brand-emerald">99.9%</div>
                <div className="text-[11px] text-slate-500">Uptime hạ tầng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
