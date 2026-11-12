import { NextRequest, NextResponse } from "next/server";
import { validateClientAuth } from "@/lib/proxy/auth";
import { calculateCostVnd } from "@/lib/proxy/pricing";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Title, HTTP-Referer",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("x-api-key");
    let clientAuth;

    try {
      clientAuth = await validateClientAuth(authHeader);
    } catch (authErr: any) {
      return NextResponse.json(
        {
          error: {
            message: authErr.message || "Unauthorized",
            type: "invalid_request_error",
            code: 401,
          },
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const model = body.model || "anthropic/claude-3.5-sonnet";
    const isStream = Boolean(body.stream);

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey || openRouterApiKey.startsWith("sk-or-v1-xxx")) {
      return NextResponse.json(
        {
          error: {
            message: "Platform OpenRouter API Key is not configured in server environment.",
            type: "server_error",
            code: 500,
          },
        },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    // Prepare upstream request payload with stream_options if streaming to guarantee usage chunks
    const upstreamBody = {
      ...body,
      ...(isStream ? { stream_options: { include_usage: true } } : {}),
    };

    const upstreamResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://ai-credit-hub.vercel.app",
        "X-Title": "AI Credit Hub",
      },
      body: JSON.stringify(upstreamBody),
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

    const supabase = createAdminClient();

    // =========================================================================
    // CASE 1: NON-STREAMING RESPONSE
    // =========================================================================
    if (!isStream) {
      const data = await upstreamResponse.json();
      const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0 };
      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;

      const totalCostVnd = calculateCostVnd(model, promptTokens, completionTokens);

      // Deduct atomically via Postgres RPC
      await supabase.rpc("deduct_credit_and_record_usage", {
        p_user_id: clientAuth.userId,
        p_key_id: clientAuth.apiKeyId,
        p_model: model,
        p_prompt_tokens: promptTokens,
        p_completion_tokens: completionTokens,
        p_total_cost_vnd: totalCostVnd,
      });

      return NextResponse.json(data, {
        headers: {
          ...CORS_HEADERS,
          "x-credit-cost-vnd": String(totalCostVnd),
        },
      });
    }

    // =========================================================================
    // CASE 2: SSE STREAMING RESPONSE
    // =========================================================================
    let capturedPromptTokens = 0;
    let capturedCompletionTokens = 0;
    let chunkCount = 0;

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Pass chunk immediately to caller for zero latency
        controller.enqueue(chunk);

        // Parse SSE chunk to inspect usage metadata
        const text = new TextDecoder().decode(chunk);
        chunkCount++;

        const lines = text.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ") && !trimmed.includes("[DONE]")) {
            try {
              const jsonStr = trimmed.slice(6);
              const parsed = JSON.parse(jsonStr);

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
        // Fallback token estimation if upstream didn't send usage chunk
        if (capturedPromptTokens === 0 && capturedCompletionTokens === 0) {
          capturedPromptTokens = Math.max(10, Math.floor(JSON.stringify(body.messages || "").length / 4));
          capturedCompletionTokens = Math.max(1, chunkCount);
        }

        const totalCostVnd = calculateCostVnd(model, capturedPromptTokens, capturedCompletionTokens);

        // Deduct atomically
        await supabase.rpc("deduct_credit_and_record_usage", {
          p_user_id: clientAuth.userId,
          p_key_id: clientAuth.apiKeyId,
          p_model: model,
          p_prompt_tokens: capturedPromptTokens,
          p_completion_tokens: capturedCompletionTokens,
          p_total_cost_vnd: totalCostVnd,
        });
      },
    });

    const stream = upstreamResponse.body?.pipeThrough(transformStream);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        ...CORS_HEADERS,
      },
    });
  } catch (err: any) {
    console.error("[Proxy Gateway Error]", err);
    return NextResponse.json(
      {
        error: {
          message: err?.message || "Internal server error",
          type: "server_error",
          code: 500,
        },
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
