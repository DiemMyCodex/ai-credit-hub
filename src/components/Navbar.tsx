"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "@/components/AuthModal";
import { Cpu, LayoutDashboard, LogIn, Sparkles } from "lucide-react";

export function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  function handleOpenAuth(mode: "signin" | "signup") {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-obsidian/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan via-accent-violet to-accent-emerald p-[1px] flex items-center justify-center shadow-lg shadow-accent-cyan/10">
              <div className="w-full h-full bg-obsidian rounded-[11px] flex items-center justify-center group-hover:bg-transparent transition duration-300">
                <Cpu className="w-5 h-5 text-accent-cyan group-hover:text-black transition" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-tight flex items-center gap-1.5 text-base">
                AI Credit Hub
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                  VN
                </span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#models" className="hover:text-white transition">Model hỗ trợ</a>
            <a href="#pricing" className="hover:text-white transition">Bảng giá Token</a>
            <a href="#features" className="hover:text-white transition">Tính năng</a>
            <a href="#quickstart" className="hover:text-white transition">Cài đặt Cursor/Cline</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-surface border border-surface-border text-white hover:border-accent-cyan transition shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-accent-cyan" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => handleOpenAuth("signin")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  onClick={() => handleOpenAuth("signup")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-black bg-gradient-to-r from-accent-cyan to-accent-violet hover:opacity-90 transition shadow-md shadow-accent-cyan/10"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tạo API Key</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
}
