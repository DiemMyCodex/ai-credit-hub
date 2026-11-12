"use client";

import { useState } from "react";
import { formatVND } from "@/lib/utils";
import { X, Key, Copy, Check, AlertTriangle, Loader2 } from "lucide-react";

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function KeyModal({ isOpen, onClose, onCreated }: KeyModalProps) {
  const [name, setName] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "My API Key",
          spendingLimit: spendingLimit ? Number(spendingLimit) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tạo key");

      setCreatedKey(data.key.rawKey);
      onCreated();
    } catch (err: any) {
      setError(err?.message || "Lỗi tạo API Key");
    } finally {
      setLoading(false);
    }
  }

  function copyKey() {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleClose() {
    setName("");
    setSpendingLimit("");
    setCreatedKey(null);
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {!createdKey ? (
          <div>
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60 mb-2.5">
                <Key className="w-3 h-3 text-zinc-400" />
                <span>Khởi Tạo API Key</span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight">
                Tạo API Key mới
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Dùng key này để kết nối với Cursor, Cline, LibreChat hoặc NextChat.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Tên khóa (Nhãn gợi nhớ)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Cursor IDE Laptop, Cline Bot..."
                  className="w-full px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Hạn mức chi tiêu trần (VNĐ){" "}
                  <span className="text-zinc-500 font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="number"
                  step="5000"
                  min="5000"
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(e.target.value)}
                  placeholder="Để trống nếu không giới hạn"
                  className="w-full px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Khóa sẽ tự động dừng nếu tiêu vượt quá số tiền này để bảo vệ ví của bạn.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-xs text-zinc-950 bg-white hover:bg-zinc-200 transition shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                ) : (
                  <span>Tạo API Key Ngay</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Khởi Tạo Thành Công</span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight">
                Lưu lại API Key của bạn
              </h2>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mt-3 flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Khóa này chỉ hiển thị <strong>một lần duy nhất</strong> vì lý do bảo mật. Hãy copy và lưu vào nơi an toàn.
                </span>
              </div>
            </div>

            <div className="mb-5">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200 break-all select-all">
                {createdKey}
              </div>
              <button
                onClick={copyKey}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-sm active:scale-[0.98]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Đã copy vào clipboard!" : "Copy API Key"}</span>
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition"
            >
              Đã lưu, đóng cửa sổ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
