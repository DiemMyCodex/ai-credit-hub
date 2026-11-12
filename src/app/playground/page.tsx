"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatVND } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  Zap,
  Trash2,
  Copy,
  Check,
} from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const AVAILABLE_MODELS = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "openai/gpt-4o", name: "GPT-4o Omnimodel", provider: "OpenAI" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek-V3", provider: "DeepSeek" },
  { id: "google/gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google" },
];

export default function Playground() {
  const [profile, setProfile] = useState<any>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>(AVAILABLE_MODELS[0].id);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Xin chào! Tôi là AI được kết nối trực tiếp qua cổng AI Credit Hub. Bạn có thể thử nghiệm tốc độ streaming và chất lượng model ngay tại đây.",
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
      const keyObj = keys.find((k) => k.id === selectedKey);
      if (!keyObj && keys.length === 0) {
        alert("Bạn chưa tạo API Key nào. Vui lòng vào Dashboard tạo ít nhất 1 key trước!");
        router.push("/dashboard");
        return;
      }

      const res = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
              // ignore partial json
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
          content: `Lỗi kết nối API: ${err.message}.`,
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Playground Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition flex items-center gap-1.5 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <div className="h-4 w-[1px] bg-zinc-800" />

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-zinc-600 font-mono"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500">Ví:</span>
              <span className="text-zinc-200 font-semibold tabular-nums">
                {formatVND(profile?.credit_balance || 0)}
              </span>
            </div>

            <button
              onClick={() => setMessages([])}
              className="p-1.5 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-900 transition"
              title="Xóa lịch sử chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        {/* Messages List */}
        <div className="space-y-4 mb-4 overflow-y-auto">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 text-sm ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`relative group max-w-[85%] rounded-xl px-4 py-3 leading-relaxed ${
                  m.role === "user"
                    ? "bg-zinc-800 text-zinc-100 rounded-tr-sm"
                    : "bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 rounded-tl-sm shadow-sm"
                }`}
              >
                <div className="whitespace-pre-wrap text-xs sm:text-sm font-sans">{m.content}</div>

                {m.role === "assistant" && m.content && (
                  <button
                    onClick={() => copyMessage(m.content, idx)}
                    className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white rounded bg-zinc-900/80 opacity-0 group-hover:opacity-100 transition"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-400 flex items-center gap-2 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Đang stream dữ liệu từ {selectedModel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Telemetry pill */}
        {streamTelemetry && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-zinc-400" />
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
            placeholder="Nhập câu hỏi để test model (Enter để gửi, Shift+Enter xuống dòng)..."
            className="w-full p-3.5 pr-12 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs sm:text-sm placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition resize-none shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-3 bottom-3.5 p-2 rounded-lg text-zinc-950 bg-white hover:bg-zinc-200 transition disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </form>
      </main>
    </div>
  );
}
