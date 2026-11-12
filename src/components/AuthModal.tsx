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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60 mb-2.5">
            <Lock className="w-3 h-3 text-zinc-400" />
            <span>AI Credit Hub Gateway</span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight">
            {mode === "signin" ? "Đăng nhập tài khoản" : "Khởi tạo tài khoản mới"}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === "signin"
              ? "Truy cập bảng điều khiển và quản lý API Key của bạn."
              : "Nhận ngay 10,000 VNĐ credit dùng thử miễn phí."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Họ và tên</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-xs text-zinc-950 bg-white hover:bg-zinc-200 transition shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
            ) : (
              <>
                <span>{mode === "signin" ? "Đăng nhập ngay" : "Tạo tài khoản & Nhận credit"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-3.5 border-t border-zinc-800 text-center">
          {mode === "signin" ? (
            <p className="text-xs text-zinc-400">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-zinc-200 hover:text-white underline font-medium"
              >
                Đăng ký nhận 10k test
              </button>
            </p>
          ) : (
            <p className="text-xs text-zinc-400">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-zinc-200 hover:text-white underline font-medium"
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
