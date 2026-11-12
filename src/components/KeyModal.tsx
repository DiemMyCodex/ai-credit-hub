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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 bg-surface border border-surface-border rounded-2xl shadow-2xl bento-glow animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface-subtle transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!createdKey ? (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-accent-violet/10 text-accent-violet border border-accent-violet/20 mb-3">
                <Key className="w-3.5 h-3.5" />
                <span>Khởi Tạo Khóa Truy Cập</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Tạo API Key mới</h2>
              <p className="text-sm text-slate-400 mt-1">
                Dùng key này để kết nối với Cursor, Cline, LibreChat hoặc NextChat.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-xs font-mono bg-accent-rose/10 border border-accent-rose/30 text-accent-rose">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tên khóa (Nhãn gợi nhớ)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Cursor IDE Laptop, Cline Bot..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian border border-surface-border text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-accent-violet transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Hạn mức chi tiêu trần (VNĐ) <span className="text-slate-500 font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="number"
                  step="5000"
                  min="5000"
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(e.target.value)}
                  placeholder="Để trống nếu không giới hạn"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian border border-surface-border text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-accent-violet transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Khóa sẽ tự động dừng nếu tiêu vượt quá số tiền này để bảo vệ ví của bạn.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-accent-violet to-accent-cyan hover:opacity-95 transition shadow-lg shadow-accent-violet/15 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <span>Tạo API Key Ngay</span>}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 mb-3">
                <Check className="w-3.5 h-3.5" />
                <span>Đã Khởi Tạo Thành Công</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Lưu lại API Key của bạn</h2>
              <div className="p-3 rounded-xl bg-accent-amber/10 border border-accent-amber/20 mt-3 flex items-start gap-2.5 text-xs text-accent-amber">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Khóa này chỉ hiển thị <strong>một lần duy nhất</strong> vì lý do bảo mật. Hãy copy và lưu vào nơi an toàn!
                </span>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="p-3.5 rounded-xl bg-obsidian border border-accent-violet/40 font-mono text-xs text-accent-cyan break-all select-all">
                {createdKey}
              </div>
              <button
                onClick={copyKey}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-accent-violet/20 border border-accent-violet/40 text-accent-violet hover:bg-accent-violet hover:text-white transition"
              >
                {copied ? <Check className="w-4 h-4 text-accent-emerald" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Đã copy vào clipboard!" : "Copy API Key"}</span>
              </button>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-surface-subtle border border-surface-border hover:text-white transition"
            >
              Tôi đã lưu, đóng cửa sổ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
