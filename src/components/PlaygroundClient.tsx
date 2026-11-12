"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, User, Bot, Trash2, Loader2, Zap, Settings, RefreshCw } from "lucide-react";
import { formatVND } from "@/lib/utils";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const PLAYGROUND_MODELS = [
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", badge: "Code", rate: "105đ / 1k" },
  { id: "openai/gpt-4o", name: "GPT-4o", badge: "Smart", rate: "87đ / 1k" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", badge: "Siêu Rẻ", rate: "5đ / 1k" },
  { id: "google/gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", badge: "Tốc Độ", rate: "3đ / 1k" },
];

export function PlaygroundClient() {
  const [model, setModel] = useState(PLAYGROUND_MODELS[0].id);
  const [systemPrompt, setSystemPrompt] = useState("Bạn là trợ lý AI thông minh, nhiệt tình và trả lời ngắn gọn, chuẩn xác.");
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Xin chào! Bạn muốn thử nghiệm sức mạnh model AI nào hôm nay? Hãy gõ câu hỏi hoặc đoạn code cần giải quyết." },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastTurnTelemetry, setLastTurnTelemetry] = useState<{ tokens: number; estimatedCost: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    const payloadMessages = [
      ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
      ...newMessages,
    ];

    try {
      const res = await fetch("/api/playground/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: payloadMessages,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Lỗi gọi AI");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Stream body unreadable");

      const decoder = new TextDecoder();
      let assistantText = "";
      let approximateTokens = 0;

      // Add empty assistant placeholder
      setMessages([...newMessages, { role: "assistant", content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const delta = data.choices?.[0]?.delta?.content || "";
              if (delta) {
                assistantText += delta;
                approximateTokens += Math.ceil(delta.length / 4);

                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantText,
                  };
                  return updated;
                });
              }
            } catch {
              // Ignore partial parse errors during streaming
            }
          }
        }
      }

      setLastTurnTelemetry({
        tokens: approximateTokens,
        estimatedCost: Math.ceil(approximateTokens * 0.1),
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Đã xảy ra sự cố kết nối";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Lỗi: ${errMsg}` },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      { role: "assistant", content: "Lịch sử trò chuyện đã được làm mới. Hãy chọn model và bắt đầu lại." },
    ]);
    setLastTurnTelemetry(null);
  };

  return (
    <div className="flex h-screen flex-col bg-obsidian text-slate-100">
      {/* Top Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-surface-card px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Dashboard</span>
          </Link>

          {/* Model Switcher */}
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isStreaming}
              className="appearance-none rounded-xl border border-white/10 bg-obsidian-200 py-1.5 pl-3 pr-8 text-xs font-semibold text-brand-cyan focus:border-brand-cyan focus:outline-none cursor-pointer"
            >
              {PLAYGROUND_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-obsidian-300 text-white">
                  {m.name} ({m.rate})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastTurnTelemetry && (
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1 text-[11px] font-mono text-slate-400 border border-white/5">
              <Zap className="w-3 h-3 text-brand-cyan" />
              <span>~{lastTurnTelemetry.tokens} tokens</span>
              <span>•</span>
              <span className="text-brand-emerald">~{formatVND(lastTurnTelemetry.estimatedCost)}</span>
            </div>
          )}

          <button
            onClick={() => setShowSystemSettings(!showSystemSettings)}
            className={`p-2 rounded-xl border transition ${
              showSystemSettings ? "border-brand-cyan bg-brand-cyan/10 text-brand-cyan" : "border-white/10 text-slate-400 hover:text-white"
            }`}
            title="Tùy chỉnh System Prompt"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearHistory}
            disabled={isStreaming}
            className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-red-400 transition"
            title="Xóa lịch sử chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* System prompt drawer */}
      {showSystemSettings && (
        <div className="border-b border-white/5 bg-obsidian-300 p-4">
          <div className="mx-auto max-w-3xl">
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              System Prompt (Chỉ dẫn hệ thống cho AI)
            </label>
            <textarea
              rows={2}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-obsidian-200 p-2.5 text-xs text-white focus:border-brand-cyan focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 text-sm ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-violet text-obsidian shadow-glow">
                  <Bot className="w-4 h-4 text-obsidian" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-brand-cyan/20 to-brand-violet/20 border border-brand-cyan/30 text-white"
                    : "bg-surface-card border border-white/10 text-slate-200"
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              </div>

              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl bg-white/10 text-slate-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isStreaming && (
            <div className="flex items-center gap-2 text-xs font-mono text-brand-cyan pl-11">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang nhận luồng token thời gian thực...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="shrink-0 border-t border-white/5 bg-surface-card p-4">
        <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Hỏi ${PLAYGROUND_MODELS.find((m) => m.id === model)?.name} bất kỳ điều gì...`}
              disabled={isStreaming}
              className="w-full rounded-2xl border border-white/10 bg-obsidian-200 py-3.5 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="absolute right-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-violet p-2.5 text-obsidian shadow-glow hover:opacity-90 disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
