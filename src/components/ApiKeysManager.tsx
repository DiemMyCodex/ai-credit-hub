"use client";

import { useState } from "react";
import { Key, Plus, Copy, Check, Trash2, Power, AlertTriangle, Shield, Loader2 } from "lucide-react";
import { formatVND } from "@/lib/utils";

export interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  spending_limit: number | null;
  total_spent: number;
  is_active: boolean;
  created_at: string;
}

interface ApiKeysManagerProps {
  initialKeys: ApiKeyItem[];
}

export function ApiKeysManager({ initialKeys }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [spendingLimit, setSpendingLimit] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdPlaintextKey, setCreatedPlaintextKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: keyName,
          spending_limit: spendingLimit ? Number(spendingLimit) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setKeys([data.key, ...keys]);
      setCreatedPlaintextKey(data.plaintextKey);
      setKeyName("");
      setSpendingLimit("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi tạo API Key");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      setKeys(keys.map((k) => (k.id === id ? { ...k, is_active: !currentStatus } : k)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi toggle trạng thái");
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa API Key này không? Các ứng dụng dùng key này sẽ ngừng hoạt động ngay lập tức.")) return;

    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa thất bại");
      setKeys(keys.filter((k) => k.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi xóa API Key");
    }
  };

  const copyKey = () => {
    if (createdPlaintextKey) {
      navigator.clipboard.writeText(createdPlaintextKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-cyan" />
            <span>Quản Lý API Keys</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tạo khóa API bí mật chuẩn OpenAI để gắn vào Cursor, Cline, LibreChat hoặc tích hợp ứng dụng.
          </p>
        </div>

        <button
          onClick={() => {
            setCreatedPlaintextKey(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet px-4 py-2.5 text-xs font-bold text-obsidian shadow-glow hover:opacity-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo API Key Mới</span>
        </button>
      </div>

      {/* Newly created key banner */}
      {createdPlaintextKey && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Hãy lưu API Key này ngay bây giờ!</span>
          </div>
          <p className="text-xs text-slate-300">
            Vì lý do an toàn, key này chỉ xuất hiện duy nhất 1 lần. Nếu bạn làm mất, bạn sẽ phải tạo key mới.
          </p>
          <div className="flex items-center gap-2 font-mono text-xs bg-obsidian-300 border border-white/10 rounded-xl p-3 text-brand-cyan">
            <span className="flex-1 break-all select-all">{createdPlaintextKey}</span>
            <button
              onClick={copyKey}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-white hover:bg-white/20 transition font-sans text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Đã chép" : "Sao chép"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Keys list */}
      <div className="rounded-2xl border border-white/10 bg-surface-card overflow-hidden">
        {keys.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Chưa có API Key nào. Hãy bấm &quot;Tạo API Key Mới&quot; để bắt đầu tích hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 bg-white/[0.02] text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Tên Khóa</th>
                  <th className="py-3 px-4 font-semibold">Tiền Tố (Prefix)</th>
                  <th className="py-3 px-4 font-semibold">Đã Tiêu / Giới Hạn</th>
                  <th className="py-3 px-4 font-semibold">Trạng Thái</th>
                  <th className="py-3 px-4 font-semibold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-sans font-medium text-white">{k.name}</td>
                    <td className="py-3.5 px-4 text-brand-cyan">{k.key_prefix}</td>
                    <td className="py-3.5 px-4">
                      <span>{formatVND(k.total_spent)}</span>
                      <span className="text-slate-500 font-sans">
                        {" "}/ {k.spending_limit ? formatVND(k.spending_limit) : "Không giới hạn"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      {k.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-[11px] font-medium border border-brand-emerald/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[11px] font-medium border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Đã thu hồi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(k.id, k.is_active)}
                          title={k.is_active ? "Tạm khóa key" : "Kích hoạt lại"}
                          className={`p-1.5 rounded-lg border transition ${
                            k.is_active
                              ? "border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                              : "border-brand-emerald/20 text-brand-emerald hover:bg-brand-emerald/10"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteKey(k.id)}
                          title="Xóa vĩnh viễn"
                          className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-surface-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Tạo API Key Mới</h3>
            <p className="text-xs text-slate-400 mb-6">
              Đặt tên nhận diện cho ứng dụng của bạn (ví dụ: Cursor AI, LibreChat...)
            </p>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tên Key *
                </label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Cursor Pro Work"
                  className="w-full rounded-xl border border-white/10 bg-obsidian-200 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Hạn mức chi tiêu tối đa (VND, tùy chọn)
                </label>
                <input
                  type="number"
                  step={10000}
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(e.target.value)}
                  placeholder="Để trống = Không giới hạn"
                  className="w-full rounded-xl border border-white/10 bg-obsidian-200 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Khi key này tiêu đạt hạn mức, các request tiếp theo sẽ tự động bị từ chối để bảo vệ ví của bạn.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet px-5 py-2.5 text-xs font-bold text-obsidian shadow-glow hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Xác nhận Tạo Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
