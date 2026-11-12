import { Zap, Cpu, Flame, Layers } from "lucide-react";

interface ModelRate {
  id: string;
  name: string;
  vendor: string;
  badge?: string;
  inputCostVND: string;
  outputCostVND: string;
  context: string;
  description: string;
  icon: typeof Zap;
  accent: string;
}

const models: ModelRate[] = [
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    vendor: "Anthropic",
    badge: "Code Vua",
    inputCostVND: "105đ / 1k token",
    outputCostVND: "525đ / 1k token",
    context: "200k",
    description: "Model mạnh nhất cho lập trình và logic phức tạp, tư duy đỉnh cao trong Cursor và Cline.",
    icon: Flame,
    accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    vendor: "OpenAI",
    badge: "Đa năng",
    inputCostVND: "87đ / 1k token",
    outputCostVND: "350đ / 1k token",
    context: "128k",
    description: "Tốc độ nhanh, hiểu ngôn ngữ tự nhiên tốt, dịch thuật và viết content chuẩn xác.",
    icon: Zap,
    accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3",
    vendor: "DeepSeek",
    badge: "Siêu rẻ",
    inputCostVND: "5đ / 1k token",
    outputCostVND: "10đ / 1k token",
    context: "64k",
    description: "Chi phí siêu tiết kiệm chỉ bằng 1/20 OpenAI nhưng năng lực ngang ngửa GPT-4o.",
    icon: Cpu,
    accent: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-brand-cyan",
  },
  {
    id: "google/gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    vendor: "Google",
    badge: "Tốc độ chớp giật",
    inputCostVND: "3đ / 1k token",
    outputCostVND: "12đ / 1k token",
    context: "1M",
    description: "Tốc độ sinh token siêu tốc, cửa sổ ngữ cảnh 1 triệu token phân tích tài liệu dài.",
    icon: Layers,
    accent: "from-violet-500/20 to-purple-500/10 border-violet-500/30 text-brand-violet",
  },
];

export function PricingSection() {
  return (
    <section id="models" className="py-20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 rounded-full mb-3">
            Bảng Giá Minh Bạch
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Bán Theo Lượng Dùng Thực Tế - Không Gói Thuê Bao Ép Buộc
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Nạp bao nhiêu dùng bấy nhiêu. Tiền trong ví không bao giờ hết hạn. Tự động quy đổi VND theo biểu phí OpenRouter chuẩn xác.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {models.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className="group relative rounded-2xl border border-white/10 bg-surface-card p-6 hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${m.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {m.badge && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200">
                        {m.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{m.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{m.vendor} • Context {m.context}</p>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">{m.description}</p>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Input:</span>
                    <span className="text-white font-medium">{m.inputCostVND}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Output:</span>
                    <span className="text-brand-cyan font-medium">{m.outputCostVND}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
