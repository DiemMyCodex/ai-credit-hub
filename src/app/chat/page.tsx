"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatVND } from "@/lib/utils";
import { TopupModal } from "@/components/TopUpModal";
import { AuthModal } from "@/components/AuthModal";
import {
  PanelLeft,
  SquarePen,
  Trash2,
  ArrowUp,
  Bot,
  Copy,
  Check,
  CreditCard,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Zap,
  ChevronDown,
  X,
  LogIn,
} from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatThread {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  updatedAt: number;
}

const AVAILABLE_MODELS = [
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    desc: "Coding và tư duy logic đỉnh nhất",
  },
  {
    id: "openai/gpt-4o-2024-11-20",
    name: "GPT-4o Omnimodel",
    provider: "OpenAI",
    desc: "Đa năng, cân bằng và thông minh",
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek-V3",
    provider: "DeepSeek",
    desc: "Thông minh như Claude, giá siêu rẻ",
  },
  {
    id: "google/gemini-3.5-flash-lite",
    name: "Gemini Flash Lite",
    provider: "Google",
    desc: "Tốc độ cực nhanh, phản hồi tức thì",
  },
];

const SUGGESTIONS = [
  {
    title: "Viết mã Next.js 15",
    prompt: "Viết component Server Action trong Next.js 15 App Router chuẩn TypeScript và xử lý lỗi.",
  },
  {
    title: "Cơ chế Atomic Transaction",
    prompt: "Giải thích cơ chế atomic transaction trong PostgreSQL và cách chống race condition khi trừ tiền ví.",
  },
  {
    title: "So sánh Claude và GPT-4o",
    prompt: "So sánh chi tiết ưu nhược điểm của Claude 3.5 Sonnet và GPT-4o trong việc viết code và refactor dự án lớn.",
  },
  {
    title: "Thiết kế kiến trúc SaaS",
    prompt: "Lên outline kiến trúc một hệ thống AI SaaS bán token quy mô 100k requests/ngày không cần server riêng.",
  },
];

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>(AVAILABLE_MODELS[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<string | null>(null);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);
  const [telemetry, setTelemetry] = useState<{ tokens: number; durationMs: number } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Load user profile & local chat threads
  useEffect(() => {
    loadUser();
    loadThreadsFromStorage();

    // Responsive: auto-close sidebar on mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Save current thread whenever messages change
  useEffect(() => {
    if (!activeThreadId) return;

    setThreads((prev) => {
      const updated = prev.map((t) => {
        if (t.id === activeThreadId) {
          const firstUserMsg = messages.find((m) => m.role === "user");
          const title = firstUserMsg
            ? firstUserMsg.content.slice(0, 36) + (firstUserMsg.content.length > 36 ? "..." : "")
            : t.title;
          return {
            ...t,
            title,
            model: selectedModel,
            messages,
            updatedAt: Date.now(),
          };
        }
        return t;
      });
      localStorage.setItem("aihub_chat_threads", JSON.stringify(updated));
      return updated;
    });
  }, [messages, selectedModel, activeThreadId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);
    }
  }

  function loadThreadsFromStorage() {
    try {
      const stored = localStorage.getItem("aihub_chat_threads");
      if (stored) {
        const parsed: ChatThread[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setThreads(parsed);
          setActiveThreadId(parsed[0].id);
          setMessages(parsed[0].messages || []);
          setSelectedModel(parsed[0].model || AVAILABLE_MODELS[0].id);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load threads from storage", e);
    }
    handleCreateNewChat();
  }

  function handleCreateNewChat() {
    const newId = `thread_${Date.now()}`;
    const newThread: ChatThread = {
      id: newId,
      title: "Cuộc trò chuyện mới",
      model: selectedModel,
      messages: [],
      updatedAt: Date.now(),
    };

    setThreads((prev) => {
      const updated = [newThread, ...prev];
      localStorage.setItem("aihub_chat_threads", JSON.stringify(updated));
      return updated;
    });

    setActiveThreadId(newId);
    setMessages([]);
    setTelemetry(null);

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  function handleSelectThread(thread: ChatThread) {
    setActiveThreadId(thread.id);
    setMessages(thread.messages || []);
    setSelectedModel(thread.model || AVAILABLE_MODELS[0].id);
    setTelemetry(null);

    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  function handleDeleteThread(e: React.MouseEvent, threadId: string) {
    e.stopPropagation();
    const updated = threads.filter((t) => t.id !== threadId);
    setThreads(updated);
    localStorage.setItem("aihub_chat_threads", JSON.stringify(updated));

    if (activeThreadId === threadId) {
      if (updated.length > 0) {
        handleSelectThread(updated[0]);
      } else {
        handleCreateNewChat();
      }
    }
  }

  async function handleSendMessage(promptToSend?: string) {
    const content = (promptToSend || input).trim();
    if (!content || loading) return;

    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (profile && profile.credit_balance < 500) {
      setTopupOpen(true);
      return;
    }

    const userMessage: Message = { role: "user", content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setTelemetry(null);

    const startTime = Date.now();
    let assistantMessage = "";
    let tokenCounter = 0;

    // Append empty assistant message for live streaming
    setMessages([...nextMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: nextMessages,
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
                setMessages([...nextMessages, { role: "assistant", content: assistantMessage }]);
              }
            } catch {
              // ignore partial json
            }
          }
        }
      }

      setTelemetry({
        tokens: tokenCounter,
        durationMs: Date.now() - startTime,
      });

      // Refresh balance in background
      if (user) {
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("credit_balance")
          .eq("id", user.id)
          .single();
        if (updatedProfile) {
          setProfile((prev: any) => ({ ...prev, credit_balance: updatedProfile.credit_balance }));
        }
      }
    } catch (err: any) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: `Lỗi: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyCode(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(id);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  }

  function handleCopyMessage(content: string, idx: number) {
    navigator.clipboard.writeText(content);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  // Format assistant markdown-like content (code blocks, bold, headers)
  function renderFormattedMessage(content: string) {
    if (!content) return null;

    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const language = lines[0].includes(" ") ? "" : lines[0].trim();
        const code = language ? lines.slice(1).join("\n") : lines.join("\n");
        const codeId = `code_${index}`;

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span>{language || "code"}</span>
              <button
                onClick={() => handleCopyCode(code, codeId)}
                className="flex items-center gap-1 text-zinc-400 hover:text-white transition"
              >
                {copiedCodeIdx === codeId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-xs font-mono text-zinc-200 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format simple bold **text** and inline `code`
      const formattedLines = part.split("\n").map((line, lIdx) => {
        // Headers
        if (line.startsWith("### ")) {
          return (
            <h4 key={lIdx} className="font-semibold text-zinc-100 mt-2 mb-1 text-sm">
              {line.slice(4)}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={lIdx} className="font-bold text-zinc-100 mt-3 mb-1.5 text-base">
              {line.slice(3)}
            </h3>
          );
        }

        // Bullet lists
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={lIdx} className="flex items-start gap-2 my-0.5 ml-2">
              <span className="text-zinc-500">•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }

        return (
          <p key={lIdx} className="my-1">
            {line}
          </p>
        );
      });

      return <div key={index}>{formattedLines}</div>;
    });
  }

  const currentModelObj = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-zinc-950 text-zinc-100 font-sans">
      {/* SIDEBAR (Collapsible like ChatGPT) */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:hidden"
        } fixed md:static inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Top: Logo + New Chat */}
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-zinc-200 tracking-tight">AI Credit Hub</span>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3">
            <button
              onClick={handleCreateNewChat}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-200 transition shadow-sm active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                <SquarePen className="w-3.5 h-3.5 text-zinc-300" />
                <span>Đoạn chat mới</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Ctrl+K</span>
            </button>
          </div>

          {/* Threads list */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Gần đây
            </div>
            {threads.map((t) => {
              const isActive = t.id === activeThreadId;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectThread(t)}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition ${
                    isActive
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                >
                  <span className="truncate pr-2">{t.title}</span>
                  <button
                    onClick={(e) => handleDeleteThread(e, t.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition"
                    title="Xóa đoạn chat"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sidebar Bottom: User & Balance */}
          <div className="p-3 border-t border-zinc-800 bg-zinc-900/90">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300">
                      {user.email ? user.email[0].toUpperCase() : "U"}
                    </div>
                    <div className="truncate text-xs">
                      <p className="font-medium text-zinc-200 truncate">{user.email?.split("@")[0]}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Ví: <span className="text-emerald-400 font-semibold">{formatVND(profile?.credit_balance || 0)}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTopupOpen(true)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded bg-zinc-800 border border-zinc-700"
                    title="Nạp VietQR"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400">
                  <Link href="/dashboard" className="hover:text-white flex items-center gap-1">
                    <LayoutDashboard className="w-3 h-3" />
                    <span>Dashboard</span>
                  </Link>
                  <button onClick={handleSignOut} className="hover:text-red-400 flex items-center gap-1">
                    <LogOut className="w-3 h-3" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập nhận 10k test</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-12 border-b border-zinc-800/80 px-3 sm:px-4 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition"
              title="Đóng / mở thanh bên"
            >
              <PanelLeft className="w-4 h-4" />
            </button>

            {/* Model Selector Dropdown (ChatGPT style) */}
            <div className="relative">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
              >
                <span>{currentModelObj.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {modelDropdownOpen && (
                <>
                  <div
                    onClick={() => setModelDropdownOpen(false)}
                    className="fixed inset-0 z-20"
                  />
                  <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1 z-30 space-y-0.5">
                    {AVAILABLE_MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          setModelDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex flex-col ${
                          selectedModel === m.id
                            ? "bg-zinc-800 text-white font-medium"
                            : "text-zinc-300 hover:bg-zinc-800/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{m.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{m.provider}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-0.5">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <div
                onClick={() => setTopupOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono cursor-pointer hover:border-zinc-700 transition"
                title="Nhấn để nạp VietQR"
              >
                <span className="text-zinc-500">Ví:</span>
                <span className="text-zinc-100 font-semibold tabular-nums">
                  {formatVND(profile?.credit_balance || 0)}
                </span>
                <span className="text-emerald-400 text-[10px] font-bold">+</span>
              </div>
            )}

            <button
              onClick={handleCreateNewChat}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition md:hidden"
              title="Đoạn chat mới"
            >
              <SquarePen className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Message Feed / Welcome Screen */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:py-6">
          {messages.length === 0 ? (
            /* ChatGPT Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 mb-4 shadow-sm">
                <Sparkles className="w-5 h-5 text-zinc-300" />
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight mb-2">
                Hôm nay tôi có thể giúp gì cho bạn?
              </h1>
              <p className="text-xs text-zinc-400 mb-8 max-w-md">
                Được kết nối trực tiếp với {currentModelObj.name} qua cổng AI Credit Hub. Hỗ trợ code, phân tích và trả lời thời gian thực.
              </p>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                {SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition text-xs group"
                  >
                    <p className="font-medium text-zinc-200 group-hover:text-white">{item.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{item.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages Stream */
            <div className="max-w-3xl w-full mx-auto space-y-6">
              {messages.map((m, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  {m.role === "user" ? (
                    /* User message bubble */
                    <div className="flex justify-end">
                      <div className="bg-zinc-800 text-zinc-100 rounded-3xl px-4 py-2.5 max-w-[85%] sm:max-w-[75%] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
                        {m.content}
                      </div>
                    </div>
                  ) : (
                    /* Assistant message */
                    <div className="flex items-start gap-3 text-xs sm:text-sm text-zinc-200 leading-relaxed group">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {renderFormattedMessage(m.content)}

                        {/* Actions below response */}
                        {m.content && (
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500 font-mono">
                            <button
                              onClick={() => handleCopyMessage(m.content, idx)}
                              className="flex items-center gap-1 hover:text-zinc-300 transition"
                            >
                              {copiedMsgIdx === idx ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Đã chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Sao chép</span>
                                </>
                              )}
                            </button>
                            <span>•</span>
                            <span>{currentModelObj.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-start gap-3 text-xs sm:text-sm text-zinc-400">
                  <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse delay-150" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse delay-300" />
                  </div>
                </div>
              )}

              {telemetry && (
                <div className="text-center text-[10px] font-mono text-zinc-500 pt-2">
                  Xuất ~{telemetry.tokens} tokens trong {(telemetry.durationMs / 1000).toFixed(2)}s
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* BOTTOM INPUT CAPSULE (Signature ChatGPT Style) */}
        <div className="shrink-0 max-w-3xl w-full mx-auto px-3 sm:px-4 pb-3 sm:pb-4 pt-1">
          <div className="relative rounded-3xl bg-zinc-900 border border-zinc-700/70 shadow-xl focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500/20 transition">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Nhắn tin cho AI (Shift + Enter để xuống dòng)..."
              className="w-full bg-transparent px-4 pt-3 pb-8 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed"
            />

            <div className="absolute right-2.5 bottom-2 flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                {currentModelObj.name.split(" ")[0]}
              </span>
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !input.trim()}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200 transition disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.95]"
                title="Gửi tin nhắn"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          <p className="text-[10px] text-center text-zinc-500 mt-2 font-sans">
            AI Credit Hub có thể đưa ra câu trả lời không chính xác. Hãy kiểm tra lại thông tin quan trọng.
          </p>
        </div>
      </main>

      {/* Modals */}
      <TopupModal
        isOpen={topupOpen}
        onClose={() => setTopupOpen(false)}
        onSuccess={loadUser}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode="signin"
      />
    </div>
  );
}
