"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatVND, formatNumber } from "@/lib/utils";
import { TopupModal } from "@/components/TopupModal";
import { KeyModal } from "@/components/KeyModal";
import {
  Cpu,
  Wallet,
  Key,
  Plus,
  Trash2,
  ExternalLink,
  MessageSquare,
  LogOut,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topupOpen, setTopupOpen] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
    if (!confirm("Bạn có chắc chắn muốn thu hồi API Key này không? Key sẽ bị vô hiệu hóa ngay lập tức.")) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400 font-mono text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-accent-cyan" />
          <span>Đang đồng bộ dữ liệu tài khoản...</span>
        </div>
      </div>
    );
  }

  const activeKeysCount = keys.filter((k) => k.is_active).length;
  const totalSpentVnd = keys.reduce((acc, k) => acc + (k.total_spent || 0), 0);

  return (
    <div className="min-h-screen bg-obsidian text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-obsidian/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-violet p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-obsidian rounded-[11px] flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-accent-cyan" />
                </div>
              </div>
              <span className="font-bold text-white tracking-tight">AI Credit Hub</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <span className="text-white border-b-2 border-accent-cyan pb-1">Bảng điều khiển</span>
              <Link href="/playground" className="text-slate-400 hover:text-white transition pb-1">
                Playground Test
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-surface-border font-mono text-xs">
              <span className="text-slate-400">Ví:</span>
              <span className="text-accent-emerald font-bold">
                {formatVND(profile?.credit_balance || 0)}
              </span>
            </div>

            <button
              onClick={() => setTopupOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-black bg-gradient-to-r from-accent-emerald to-accent-cyan hover:opacity-95 transition shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Nạp VietQR</span>
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface transition"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Welcome & Balance Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Balance */}
          <div className="p-6 rounded-2xl bg-surface border border-surface-border bento-glow relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Số dư khả dụng
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald animate-pulse" />
              </div>
              <h2 className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatVND(profile?.credit_balance || 0)}
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Được bảo vệ bởi cơ chế kiểm soát số dư nguyên tử (PostgreSQL atomic transactions).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
              <button
                onClick={() => setTopupOpen(true)}
                className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1"
              >
                <span>Nạp thêm credit VietQR</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 2: Active Keys */}
          <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Khóa API Đang Chạy
                </span>
                <Key className="w-4 h-4 text-accent-violet" />
              </div>
              <h2 className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {activeKeysCount} <span className="text-sm text-slate-500 font-normal">/ {keys.length} keys</span>
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Hỗ trợ cắm đồng thời vào Cursor, Cline, LibreChat và các bot tự động.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
              <button
                onClick={() => setKeyModalOpen(true)}
                className="text-xs font-semibold text-accent-violet hover:underline flex items-center gap-1"
              >
                <span>Tạo thêm key mới</span>
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 3: Total Spent */}
          <div className="p-6 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Tổng Chi Tiêu Đã Dùng
                </span>
                <Wallet className="w-4 h-4 text-accent-amber" />
              </div>
              <h2 className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatVND(totalSpentVnd)}
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Khấu trừ thời gian thực dựa trên token usage thực tế của OpenRouter.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
              <Link
                href="/playground"
                className="text-xs font-semibold text-accent-amber hover:underline flex items-center gap-1"
              >
                <span>Vào Playground chat thử</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* API Keys Table */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Danh sách API Keys</h3>
              <p className="text-xs text-slate-400 mt-1">
                Quản lý các khóa truy cập và hạn mức chi tiêu cho từng ứng dụng của bạn.
              </p>
            </div>
            <button
              onClick={() => setKeyModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-black bg-gradient-to-r from-accent-cyan to-accent-violet hover:opacity-90 transition shadow-sm"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Tạo API Key Mới</span>
            </button>
          </div>

          {keys.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-surface-border rounded-xl">
              <Key className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Bạn chưa tạo API Key nào.</p>
              <p className="text-xs text-slate-500 mt-1">Nhấn nút bên trên để tạo key đầu tiên.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-surface-border text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Trạng thái</th>
                    <th className="pb-3 font-medium">Tên khóa</th>
                    <th className="pb-3 font-medium">Tiền tố Key</th>
                    <th className="pb-3 font-medium">Hạn mức</th>
                    <th className="pb-3 font-medium">Đã tiêu</th>
                    <th className="pb-3 font-medium">Ngày tạo</th>
                    <th className="pb-3 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-surface-subtle/50 transition">
                      <td className="py-3.5">
                        {k.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
                            <span>Hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-accent-rose/10 text-accent-rose border border-accent-rose/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
                            <span>Đã thu hồi</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 font-bold text-white font-sans">{k.name}</td>
                      <td className="py-3.5 text-accent-cyan font-mono">{k.key_prefix}</td>
                      <td className="py-3.5 text-slate-300">
                        {k.spending_limit ? formatVND(k.spending_limit) : "Không giới hạn"}
                      </td>
                      <td className="py-3.5 text-slate-300">{formatVND(k.total_spent || 0)}</td>
                      <td className="py-3.5 text-slate-500">
                        {new Date(k.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3.5 text-right">
                        {k.is_active && (
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="p-1.5 text-slate-500 hover:text-accent-rose rounded-lg hover:bg-surface-subtle transition"
                            title="Thu hồi key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Integration Instructions Card */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-base font-bold text-white">Hướng dẫn cắm vào Cursor IDE</h3>
          </div>
          <div className="space-y-3 text-xs text-slate-400 leading-relaxed font-sans">
            <p>
              1. Trong <strong>Cursor Settings</strong> &gt; <strong>Models</strong>, bật mục <strong>OpenAI API Key</strong>.
            </p>
            <p>
              2. Nhập <strong>Override OpenAI Base URL</strong> là:{" "}
              <code className="text-accent-cyan bg-obsidian px-2 py-0.5 rounded font-mono">
                {typeof window !== "undefined" ? window.location.origin : "https://your-domain.vercel.app"}/v1
              </code>
            </p>
            <p>
              3. Dán <strong>API Key</strong> của bạn (bắt đầu bằng <code className="text-accent-violet">sk-aihub-...</code>) vào ô API Key.
            </p>
            <p>
              4. Thêm tên model bạn muốn dùng (ví dụ: <code className="text-white font-mono">anthropic/claude-3.5-sonnet</code> hoặc <code className="text-white font-mono">deepseek/deepseek-chat</code>).
            </p>
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
