"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatVND } from "@/lib/utils";
import { TopupModal } from "@/components/TopUpModal";
import { KeyModal } from "@/components/KeyModal";
import {
  Cpu,
  Key,
  Plus,
  Trash2,
  ExternalLink,
  LogOut,
  CreditCard,
  Copy,
  Check,
  Terminal,
  Loader2,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupOpen, setTopupOpen] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [copiedPrefix, setCopiedPrefix] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      setUser(user);

      // Load profile balance
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Load keys
      const keysRes = await fetch("/api/keys");
      if (keysRes.ok) {
        const keysData = await keysRes.json();
        setKeys(keysData.keys || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeKey(keyId: string) {
    if (
      !confirm(
        "Bạn có chắc chắn muốn thu hồi API Key này không? Key sẽ bị vô hiệu hóa ngay lập tức."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/keys?keyId=${keyId}`, { method: "DELETE" });
      if (res.ok) {
        setKeys((prev) =>
          prev.map((k) => (k.id === keyId ? { ...k, is_active: false } : k))
        );
      }
    } catch (err) {
      console.error("Revoke error", err);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleCopyPrefix(prefix: string) {
    navigator.clipboard.writeText(prefix);
    setCopiedPrefix(prefix);
    setTimeout(() => setCopiedPrefix(null), 2000);
  }

  function handleCopyBaseUrl() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/v1`
        : "https://your-domain.vercel.app/v1";
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
          <span>Đang đồng bộ dữ liệu...</span>
        </div>
      </div>
    );
  }

  const activeKeysCount = keys.filter((k) => k.is_active).length;
  const totalSpentVnd = keys.reduce((acc, k) => acc + (k.total_spent || 0), 0);
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/v1`
      : "https://your-domain.vercel.app/v1";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Header - Sleek Minimalist */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 group-hover:border-zinc-700 transition">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-sm text-zinc-100 tracking-tight">
                AI Credit Hub
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-3 text-xs font-medium">
              <span className="text-zinc-100 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
                Dashboard
              </span>
              <Link
                href="/chat"
                className="text-zinc-400 hover:text-zinc-200 transition px-2 py-1 flex items-center gap-1"
              >
                <span>Chat AI</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Balance Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono">
              <span className="text-zinc-500 font-normal">Ví:</span>
              <span className="text-zinc-100 font-semibold tabular-nums">
                {formatVND(profile?.credit_balance || 0)}
              </span>
            </div>

            {/* Top-up Button */}
            <button
              onClick={() => setTopupOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-950 bg-white hover:bg-zinc-200 transition shadow-sm active:scale-[0.98]"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Nạp VietQR</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 mb-6">
          {/* Card 1: Balance */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700/60 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Số dư khả dụng
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-zinc-100 font-mono tracking-tight tabular-nums">
                {formatVND(profile?.credit_balance || 0)}
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Khấu trừ tự động theo token usage thực tế qua PostgreSQL RPC.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/60">
              <button
                onClick={() => setTopupOpen(true)}
                className="text-xs font-medium text-zinc-300 hover:text-white transition flex items-center gap-1"
              >
                <span>Nạp thêm VietQR</span>
                <span className="text-zinc-500">→</span>
              </button>
            </div>
          </div>

          {/* Card 2: Active Keys */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700/60 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  API Keys hoạt động
                </span>
                <Key className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-zinc-100 font-mono tracking-tight tabular-nums">
                {activeKeysCount}{" "}
                <span className="text-sm font-normal text-zinc-400">
                  / {keys.length} keys
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Tương thích mọi client OpenAI: Cursor, Cline, LibreChat.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/60">
              <button
                onClick={() => setKeyModalOpen(true)}
                className="text-xs font-medium text-zinc-300 hover:text-white transition flex items-center gap-1"
              >
                <span>Tạo key mới</span>
                <span className="text-zinc-500">+</span>
              </button>
            </div>
          </div>

          {/* Card 3: Total Spent */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700/60 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Tổng chi tiêu đã dùng
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-zinc-100 font-mono tracking-tight tabular-nums">
                {formatVND(totalSpentVnd)}
              </div>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Dữ liệu tiêu thụ thực tế được tính toán chuẩn xác từ streaming chunk.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/60">
              <Link
                href="/chat"
                className="text-xs font-medium text-zinc-300 hover:text-white transition flex items-center gap-1"
              >
                <span>Mở Chat AI (Giao diện ChatGPT)</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="p-4 sm:p-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight">
                Danh sách API Keys
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Quản lý các khóa truy cập và hạn mức chi tiêu cho từng ứng dụng.
              </p>
            </div>
            <button
              onClick={() => setKeyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-950 bg-white hover:bg-zinc-200 transition shadow-sm active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo API Key Mới</span>
            </button>
          </div>

          {keys.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-zinc-800 rounded-lg">
              <Key className="w-7 h-7 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">Chưa có API Key nào được tạo.</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Bấm nút "Tạo API Key Mới" bên trên để bắt đầu kết nối.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW: Sleek Responsive Cards (fixes the squashed table bug) */}
              <div className="block sm:hidden space-y-3">
                {keys.map((k) => (
                  <div
                    key={k.id}
                    className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-xs text-zinc-100 truncate">
                        {k.name}
                      </span>
                      {k.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50 whitespace-nowrap">
                          Đã thu hồi
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-zinc-900/90 px-2.5 py-1.5 rounded border border-zinc-800 text-xs font-mono text-zinc-300">
                      <span className="truncate">{k.key_prefix}</span>
                      <button
                        onClick={() => handleCopyPrefix(k.key_prefix)}
                        className="text-zinc-400 hover:text-zinc-200 shrink-0"
                        title="Copy tiền tố"
                      >
                        {copiedPrefix === k.key_prefix ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono pt-1">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">HẠN MỨC</span>
                        <span className="text-zinc-300">
                          {k.spending_limit ? formatVND(k.spending_limit) : "Không giới hạn"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">ĐÃ TIÊU</span>
                        <span className="text-zinc-300">{formatVND(k.total_spent || 0)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px]">
                      <span className="text-zinc-500 font-mono">
                        {new Date(k.created_at).toLocaleDateString("vi-VN")}
                      </span>
                      {k.is_active && (
                        <button
                          onClick={() => handleRevokeKey(k.id)}
                          className="flex items-center gap-1 text-red-400 hover:text-red-300 transition text-[11px]"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Thu hồi</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP VIEW: Clean Spacious Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-[640px] w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px]">
                      <th className="pb-2.5 font-medium">Trạng thái</th>
                      <th className="pb-2.5 font-medium">Tên khóa</th>
                      <th className="pb-2.5 font-medium">Tiền tố Key</th>
                      <th className="pb-2.5 font-medium">Hạn mức</th>
                      <th className="pb-2.5 font-medium">Đã tiêu</th>
                      <th className="pb-2.5 font-medium">Ngày tạo</th>
                      <th className="pb-2.5 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-zinc-800/30 transition">
                        <td className="py-3">
                          {k.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                              Đã thu hồi
                            </span>
                          )}
                        </td>
                        <td className="py-3 font-medium text-zinc-200 font-sans">{k.name}</td>
                        <td className="py-3 text-zinc-300 font-mono">
                          <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80">
                            {k.key_prefix}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-400">
                          {k.spending_limit ? formatVND(k.spending_limit) : "Không giới hạn"}
                        </td>
                        <td className="py-3 text-zinc-300 tabular-nums">
                          {formatVND(k.total_spent || 0)}
                        </td>
                        <td className="py-3 text-zinc-400">
                          {new Date(k.created_at).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-3 text-right">
                          {k.is_active && (
                            <button
                              onClick={() => handleRevokeKey(k.id)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800 transition"
                              title="Thu hồi key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Integration Instructions - Minimalist Terminal Style */}
        <div className="p-4 sm:p-6 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200">
              Hướng dẫn kết nối với Cursor / Cline / LibreChat
            </h3>
          </div>
          <div className="space-y-2.5 text-xs text-zinc-400 leading-relaxed font-sans">
            <div className="flex items-start gap-2">
              <span className="text-zinc-400 font-mono shrink-0">1.</span>
              <p>
                Mở <strong>Cursor Settings</strong> &gt; <strong>Models</strong>, bật mục{" "}
                <strong>OpenAI API Key</strong>.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-400 font-mono shrink-0">2.</span>
              <div className="flex-1">
                <span>Nhập <strong>Override OpenAI Base URL</strong>:</span>
                <div className="mt-1 flex items-center gap-2">
                  <code className="text-zinc-200 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 font-mono text-xs">
                    {baseUrl}
                  </code>
                  <button
                    onClick={handleCopyBaseUrl}
                    className="p-1 text-zinc-400 hover:text-white transition"
                    title="Copy Base URL"
                  >
                    {copiedUrl ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-400 font-mono shrink-0">3.</span>
              <p>
                Dán <strong>API Key</strong> của bạn (bắt đầu bằng{" "}
                <code className="text-zinc-300 font-mono">sk-aihub-...</code>) vào ô API Key.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-zinc-400 font-mono shrink-0">4.</span>
              <p>
                Thêm model cần dùng (ví dụ:{" "}
                <code className="text-zinc-300 font-mono">anthropic/claude-3.5-sonnet</code> hoặc{" "}
                <code className="text-zinc-300 font-mono">deepseek/deepseek-chat</code>).
              </p>
            </div>
          </div>
        </div>
      </main>

      <TopupModal
        isOpen={topupOpen}
        onClose={() => setTopupOpen(false)}
        onSuccess={loadUserData}
      />

      <KeyModal
        isOpen={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        onCreated={loadUserData}
      />
    </div>
  );
}
