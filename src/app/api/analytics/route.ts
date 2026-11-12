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
    const rawLogs = (logs as any[]) || [];

    for (const log of rawLogs) {
      const modelName = String(log.model || "unknown");
      if (!modelStats[modelName]) {
        modelStats[modelName] = { requests: 0, tokens: 0, costVnd: 0 };
      }
      modelStats[modelName].requests += 1;
      modelStats[modelName].tokens += Number(log.total_tokens) || 0;
      modelStats[modelName].costVnd += Number(log.total_cost_vnd) || 0;
    }

    return NextResponse.json({
      logs: rawLogs,
      modelStats,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
