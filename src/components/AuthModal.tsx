"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { X, Lock, Mail, Loader2, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split("@")[0],
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          router.push("/dashboard");
          onClose();
        } else {
          setSuccessMsg("Tài khoản đã tạo thành công! Hãy kiểm tra email để xác thực hoặc đăng nhập.");
          setMode("signin");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        router.push("/dashboard");
        router.refresh();
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi trong quá trình xác thực.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 bg-surface border border-surface-border rounded-2xl shadow-2xl bento-glow animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface-subtle transition"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>AI Credit Hub Gateway</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === "signin" ? "Đăng nhập tài khoản" : "Khởi tạo tài khoản mới"}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {mode === "signin"
              ? "Truy cập bảng điều khiển và quản lý API Key của bạn."
              : "Nhận ngay 10,000 VNĐ credit dùng thử miễn phí."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-xs font-mono bg-accent-rose/10 border border-accent-rose/30 text-accent-rose">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg text-xs font-mono bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Họ và tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian border border-surface-border text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-accent-cyan transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-obsidian border border-surface-border text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-accent-cyan transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-obsidian border border-surface-border text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-accent-cyan transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm text-black bg-gradient-to-r from-accent-cyan to-accent-violet hover:opacity-95 transition shadow-lg shadow-accent-cyan/10 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <>
                <span>{mode === "signin" ? "Đăng nhập ngay" : "Tạo tài khoản & Nhận credit"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-surface-border text-center">
          {mode === "signin" ? (
            <p className="text-xs text-slate-400">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-accent-cyan hover:underline font-medium"
              >
                Đăng ký nhận 10k test
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-accent-cyan hover:underline font-medium"
              >
                Đăng nhập ngay
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
