import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateCostVnd, resolveUpstreamModel } from "@/lib/proxy/pricing";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUserClient = await createServerClient();
    const {
      data: { user },
    } = await supabaseUserClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: {
            message: "Vui lòng đăng nhập để sử dụng giao diện Chat trực tiếp.",
            type: "auth_required",
            code: 401,
          },
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const adminSupabase = createAdminClient();

    // Check user profile credit balance
    const { data: profile, error: profileErr } = await adminSupabase
      .from("profiles")
      .select("id, credit_balance")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(
        {
          error: {
            message: "Không tìm thấy hồ sơ người dùng.",
            type: "profile_not_found",
            code: 404,
          },
        },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Minimum balance to start chat is 500 VND
    if (profile.credit_balance < 500) {
      return NextResponse.json(
        {
          error: {
            message: "Số dư ví dưới 500 VNĐ. Vui lòng nạp thêm credit VietQR để tiếp tục trò chuyện.",
            type: "insufficient_funds",
            code: 402,
          },
        },
        { status: 402, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const model = resolveUpstreamModel(body.model || "anthropic/claude-sonnet-4.5");
    const messages = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          error: {
            message: "Danh sách tin nhắn không hợp lệ.",
            type: "invalid_request_error",
            code: 400,
          },
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey || openRouterApiKey.startsWith("sk-or-v1-xxx")) {
      return NextResponse.json(
        {
          error: {
            message: "Hệ thống chưa cấu hình OPENROUTER_API_KEY trên server.",
            type: "server_error",
            code: 500,
          },
        },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const upstreamPayload = {
      model,
      messages,
      stream: true,
      stream_options: { include_usage: true },
    };

    const upstreamResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://ai-credit-hub.vercel.app",
        "X-Title": "AI Credit Hub Web Chat",
      },
      body: JSON.stringify(upstreamPayload),
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return new NextResponse(errorText, {
        status: upstreamResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        },
      });
    }

    let capturedPromptTokens = 0;
    let capturedCompletionTokens = 0;
    let chunkCount = 0;
    const decoder = new TextDecoder();
    let streamBuffer = "";

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk);

        const text = decoder.decode(chunk, { stream: true });
        streamBuffer += text;

        const lines = streamBuffer.split("\n");
        streamBuffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ") && !trimmed.includes("[DONE]")) {
            chunkCount++;
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              if (parsed.usage) {
                capturedPromptTokens = parsed.usage.prompt_tokens || capturedPromptTokens;
                capturedCompletionTokens = parsed.usage.completion_tokens || capturedCompletionTokens;
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      },
      async flush() {
        // Fallback approximation if OpenRouter usage chunk was missing
        if (capturedPromptTokens === 0 && capturedCompletionTokens === 0) {
          const promptChars = messages.reduce(
            (acc: number, m: any) => acc + (m.content ? String(m.content).length : 0),
            0
          );
          capturedPromptTokens = Math.max(10, Math.ceil(promptChars / 4));
          capturedCompletionTokens = Math.max(1, chunkCount);
        }

        const totalCostVnd = calculateCostVnd(model, capturedPromptTokens, capturedCompletionTokens);

        try {
          await adminSupabase.rpc("deduct_credit_and_record_usage", {
            p_user_id: user.id,
            p_key_id: null,
            p_model: model,
            p_prompt_tokens: capturedPromptTokens,
            p_completion_tokens: capturedCompletionTokens,
            p_total_cost_vnd: totalCostVnd,
          });
        } catch (dbErr) {
          console.error("Web chat credit deduction failed:", dbErr);
        }
      },
    });

    return new NextResponse(upstreamResponse.body?.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        ...CORS_HEADERS,
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: {
          message: error?.message || "Lỗi máy chủ nội bộ",
          type: "server_error",
          code: 500,
        },
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
