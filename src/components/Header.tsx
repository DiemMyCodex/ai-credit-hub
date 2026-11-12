"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Terminal, LogIn, User } from "lucide-react";
import { AuthModal } from "./AuthModal";

interface HeaderProps {
  userEmail?: string | null;
}

export function Header({ userEmail }: HeaderProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-obsidian/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-violet shadow-glow">
              <Sparkles className="w-4 h-4 text-obsidian" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              AI Credit <span className="bg-gradient-to-r from-brand-cyan to-brand-violet bg-clip-text text-transparent">Hub</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#models" className="hover:text-white transition">Bảng giá Models</a>
            <a href="#features" className="hover:text-white transition">Tính năng</a>
            <a href="#quickstart" className="hover:text-white transition">Tích hợp Cursor</a>
          </nav>

          <div className="flex items-center gap-3">
            {userEmail ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-card px-4 py-2 text-xs font-medium text-white hover:border-brand-cyan/50 hover:bg-white/5 transition"
              >
                <User className="w-3.5 h-3.5 text-brand-cyan" />
                <span>{userEmail}</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setAuthOpen(true);
                  }}
                  className="rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthOpen(true);
                  }}
                  className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet px-4 py-2 text-xs font-semibold text-obsidian shadow-glow hover:opacity-90 transition"
                >
                  Bắt đầu ngay
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
