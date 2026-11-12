import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch recent 100 usage logs
    const { data: logs, error } = await supabase
      .from("usage_logs")
      .select("id, model, prompt_tokens, completion_tokens, total_tokens, total_cost_vnd, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate by model
    const modelStats: Record<string, { requests: number; tokens: number; costVnd: number }> = {};
    for (const log of logs || []) {
      if (!modelStats[log.model]) {
        modelStats[log.model] = { requests: 0, tokens: 0, costVnd: 0 };
      }
      modelStats[log.model].requests += 1;
      modelStats[log.model].tokens += log.total_tokens || 0;
      modelStats[log.model].costVnd += log.total_cost_vnd || 0;
    }

    return NextResponse.json({
      logs: logs || [],
      modelStats,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
