import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { calculateTokenCostVND } from "@/lib/pricing";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Vui lòng đăng nhập." }, { status: 401 });
    }

    // Check user balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("credit_balance")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credit_balance < 1000) {
      return NextResponse.json(
        { error: "Số dư ví dưới 1,000 VND. Vui lòng nạp thêm qua VietQR để tiếp tục chat." },
        { status: 402 }
      );
    }

    const { messages, model } = await request.json();
    const selectedModel = model || "anthropic/claude-3.5-sonnet";

    const upstreamApiKey = process.env.OPENROUTER_API_KEY || "dummy-key";
    const upstreamUrl = process.env.UPSTREAM_URL || "https://openrouter.ai/api/v1/chat/completions";

    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${upstreamApiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://ai-credit-hub.vercel.app",
        "X-Title": "AI Credit Hub Playground",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        stream: true,
        stream_options: { include_usage: true },
      }),
    });

    if (!upstreamRes.ok) {
      const err = await upstreamRes.text();
      return new NextResponse(err, { status: upstreamRes.status });
    }

    const adminSupabase = getAdminSupabaseClient();
    let promptTokens = 0;
    let completionTokens = 0;
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
          if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.usage) {
                promptTokens = data.usage.prompt_tokens || promptTokens;
                completionTokens = data.usage.completion_tokens || completionTokens;
              }
            } catch {
              // Ignore partial JSON chunks
            }
          }
        }
      },
      async flush() {
        if (promptTokens === 0 && completionTokens === 0) {
          promptTokens = 120;
          completionTokens = 200;
        }

        const costVND = calculateTokenCostVND(selectedModel, promptTokens, completionTokens);

        try {
          await adminSupabase.rpc("deduct_credit_and_record_usage", {
            p_user_id: user.id,
            p_api_key_id: null,
            p_model: selectedModel,
            p_prompt_tokens: promptTokens,
            p_completion_tokens: completionTokens,
            p_cost_vnd: costVND,
          });
        } catch (dbErr) {
          console.error("Playground credit deduction failed:", dbErr);
        }
      },
    });

    return new NextResponse(upstreamRes.body?.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
