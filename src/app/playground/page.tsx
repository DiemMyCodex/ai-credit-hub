"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatVND } from "@/lib/utils";
import {
  Cpu,
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User as UserIcon,
  Zap,
  Activity,
  Layers,
  Trash2,
  Copy,
  Check,
} from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const AVAILABLE_MODELS = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", tag: "Coding Trùm" },
  { id: "openai/gpt-4o", name: "GPT-4o Omnimodel", provider: "OpenAI", tag: "Đa Năng" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek-V3", provider: "DeepSeek", tag: "Siêu Rẻ" },
  { id: "google/gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google", tag: "Cực Nhanh" },
];

export default function Playground() {
  const [profile, setProfile] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>(AVAILABLE_MODELS[0].id);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Xin chào! Tôi là AI được kết nối trực tiếp qua cổng AI Credit Hub. Bạn có thể thử nghiệm tốc độ streaming và độ thông minh của model ngay tại đây.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [streamTelemetry, setStreamTelemetry] = useState<{ tokens: number; durationMs: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadUserAndKeys();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadUserAndKeys() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(profileData);

    const keysRes = await fetch("/api/keys");
    if (keysRes.ok) {
      const data = await keysRes.json();
      const active = (data.keys || []).filter((k: any) => k.is_active);
      setKeys(active);
      if (active.length > 0) {
        setSelectedKey(active[0].id);
      }
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreamTelemetry(null);

    const startTime = Date.now();
    let assistantMessage = "";
    let tokenCounter = 0;

    // Append empty assistant message for streaming
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    try {
      // Find current selected key prefix or ask user to create key
      const keyObj = keys.find((k) => k.id === selectedKey);
      if (!keyObj && keys.length === 0) {
        alert("Bạn chưa tạo API Key nào. Vui lòng vào Dashboard tạo ít nhất 1 key trước!");
        router.push("/dashboard");
        return;
      }

      // In browser playground, we call internal API route with current user session
      // For testing, proxy route handler accepts Bearer token or cookie auth
      const res = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Send key header if client stored raw key, or let playground test via standard route
          Authorization: `Bearer sk-aihub-internal-playground-test`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: newMessages,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("Stream reader not available");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ") && !trimmed.includes("[DONE]")) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices?.[0]?.delta?.content || "";
              if (delta) {
                assistantMessage += delta;
                tokenCounter++;
                setMessages([...newMessages, { role: "assistant", content: assistantMessage }]);
              }
            } catch {
              // ignore partial
            }
          }
        }
      }

      setStreamTelemetry({
        tokens: tokenCounter,
        durationMs: Date.now() - startTime,
      });

      // Refresh balance
      const { data: updatedProfile } = await supabase
        .from("profiles")
        .select("credit_balance")
        .eq("id", profile.id)
        .single();
      if (updatedProfile) {
        setProfile((prev: any) => ({ ...prev, credit_balance: updatedProfile.credit_balance }));
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `Lỗi kết nối API: ${err.message}. (Gợi ý: Hãy kiểm tra xem bạn đã cấu hình OPENROUTER_API_KEY trong file .env chưa hoặc ví còn đủ 1,000đ không).`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function copyMessage(content: string, index: number) {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div className="min-h-screen bg-obsidian text-slate-100 flex flex-col">
      {/* Playground Header */}
      <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-obsidian/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface transition flex items-center gap-1.5 text-xs font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Về Dashboard</span>
            </Link>

            <div className="h-5 w-[1px] bg-surface-border" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-surface border border-surface-border text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-accent-cyan font-mono"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface border border-surface-border">
              <span className="text-slate-400">Số dư:</span>
              <span className="text-accent-emerald font-bold">
                {formatVND(profile?.credit_balance || 0)}
              </span>
            </div>

            <button
              onClick={() => setMessages([])}
              className="p-2 text-slate-500 hover:text-accent-rose rounded-lg hover:bg-surface transition"
              title="Xóa lịch sử chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* Messages List */}
        <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-sm ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative group max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-accent-cyan/20 to-accent-violet/20 border border-accent-cyan/30 text-white rounded-tr-none"
                    : "bg-surface border border-surface-border text-slate-200 rounded-tl-none shadow-md"
                }`}
              >
                <div className="whitespace-pre-wrap text-xs sm:text-sm font-sans">{m.content}</div>

                {m.role === "assistant" && m.content && (
                  <button
                    onClick={() => copyMessage(m.content, idx)}
                    className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-white rounded bg-surface/80 opacity-0 group-hover:opacity-100 transition"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-accent-emerald" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-surface border border-surface-border text-xs text-slate-400 flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span>Đang stream dữ liệu từ {selectedModel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Telemetry pill */}
        {streamTelemetry && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-accent-amber" />
              <span>Đã xuất ~{streamTelemetry.tokens} tokens</span>
            </span>
            <span>Thời gian: {(streamTelemetry.durationMs / 1000).toFixed(2)}s</span>
          </div>
        )}

        {/* Prompt Input Form */}
        <form onSubmit={handleSendMessage} className="relative">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Nhập câu hỏi để test model (Nhấn Enter để gửi, Shift+Enter để xuống dòng)..."
            className="w-full p-4 pr-14 rounded-2xl bg-surface border border-surface-border text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-accent-cyan transition resize-none shadow-xl shadow-black/50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-3.5 bottom-4 p-2.5 rounded-xl text-black bg-gradient-to-r from-accent-cyan to-accent-violet hover:opacity-95 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </main>
    </div>
  );
}
