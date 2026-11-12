"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthModal } from "@/components/AuthModal";
import { Cpu, LayoutDashboard, LogIn, MessageSquare } from "lucide-react";

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
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 group-hover:border-zinc-700 transition">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-zinc-100 tracking-tight">
                AI Credit Hub
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                VN
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-xs text-zinc-400">
            <Link href="/chat" className="text-zinc-200 hover:text-white transition flex items-center gap-1 font-medium">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat AI</span>
            </Link>
            <a href="#models" className="hover:text-zinc-200 transition">Model hỗ trợ</a>
            <a href="#pricing" className="hover:text-zinc-200 transition">Bảng giá Token</a>
            <a href="#features" className="hover:text-zinc-200 transition">Tính năng</a>
            <a href="#quickstart" className="hover:text-zinc-200 transition">Cài đặt Cursor/Cline</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/chat"
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-200"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-100 hover:bg-zinc-800 transition shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => handleOpenAuth("signin")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  onClick={() => handleOpenAuth("signup")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-950 bg-white hover:bg-zinc-200 transition shadow-sm active:scale-[0.98]"
                >
                  <span>Nhận 10k Test</span>
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
