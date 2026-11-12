"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Wallet, Plus, Terminal, LogOut, ExternalLink, Zap } from "lucide-react";
import { TopUpModal } from "./TopUpModal";
import { ApiKeysManager, type ApiKeyItem } from "./ApiKeysManager";
import { formatVND } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface DashboardClientProps {
  email: string;
  initialBalance: number;
  initialKeys: ApiKeyItem[];
}

export function DashboardClient({ email, initialBalance, initialKeys }: DashboardClientProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const refreshBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("credit_balance")
        .eq("id", user.id)
        .single();
      if (profile) {
        setBalance(profile.credit_balance);
      }
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-slate-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-obsidian/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-violet text-obsidian shadow-glow">
              <Sparkles className="w-4 h-4 text-obsidian" />
            </div>
            <span className="font-bold tracking-tight text-white text-sm">
              AI Credit <span className="text-brand-cyan">Hub</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/dashboard/playground"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-brand-cyan hover:bg-white/10 transition"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Playground Chat</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
              title="Đăng xuất"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Balance Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Balance & TopUp */}
          <div className="md:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-surface-card via-obsidian-200 to-obsidian p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-brand-cyan" />
                  Số Dư Khả Dụng
                </span>
                <span className="text-xs text-slate-500 font-mono truncate max-w-[200px]">
                  {email}
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2">
                {formatVND(balance)}
              </div>
              <p className="text-xs text-slate-400 max-w-md">
                Tương đương ~{(balance / 105).toFixed(0)}k token Claude 3.5 Sonnet hoặc ~{(balance / 5).toFixed(0)}k token DeepSeek-V3.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-cyan to-brand-violet px-6 py-3 font-bold text-obsidian text-xs shadow-glow hover:opacity-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Nạp Tiền VietQR Tự Động</span>
              </button>
              <span className="text-xs text-slate-500">
                Tự động cộng sau 3s qua SePay
              </span>
            </div>
          </div>

          {/* Card 2: Quick Endpoint Info */}
          <div className="rounded-3xl border border-white/10 bg-surface-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-violet mb-4">
                <Zap className="w-4 h-4" />
                <span>Thông Số Tích Hợp</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-500 mb-1">OpenAI Base URL:</div>
                  <div className="font-mono bg-obsidian-300 border border-white/5 rounded-xl p-2.5 text-brand-cyan truncate select-all">
                    https://your-domain.vercel.app/v1
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Header xác thực:</div>
                  <div className="font-mono bg-obsidian-300 border border-white/5 rounded-xl p-2.5 text-slate-300 truncate">
                    Authorization: Bearer sk-aihub-...
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <Link
                href="/dashboard/playground"
                className="flex items-center justify-between text-xs text-brand-cyan hover:underline"
              >
                <span>Mở Chat Playground thử ngay</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* API Keys Management */}
        <ApiKeysManager initialKeys={initialKeys} />
      </main>

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={() => {
          refreshBalance();
        }}
      />
    </div>
  );
}
