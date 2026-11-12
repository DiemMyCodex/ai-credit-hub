import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const configuredKey = process.env.SEPAY_API_KEY;
    const authHeader = req.headers.get("authorization");

    // Verify SePay API Key if configured
    if (configuredKey && configuredKey !== "your_sepay_api_secret_key") {
      const isValid =
        authHeader === `Apikey ${configuredKey}` ||
        authHeader === `Bearer ${configuredKey}` ||
        authHeader === configuredKey;

      if (!isValid) {
        return NextResponse.json({ error: "Unauthorized SePay webhook signature" }, { status: 401 });
      }
    }

    const payload = await req.json();
    const content = payload.content || payload.description || "";
    const transferType = payload.transferType || "in";

    // Only process incoming transfers
    if (transferType !== "in") {
      return NextResponse.json({ success: true, message: "Ignored outgoing transfer" });
    }

    // Extract AIHUBxxxxxx code from transaction content
    const match = content.match(/AIHUB[A-Z0-9]{6}/i);
    if (!match) {
      return NextResponse.json(
        { success: false, message: "No AIHUB order code found in transfer content" },
        { status: 200 }
      );
    }

    const orderCode = match[0].toUpperCase();
    const reference = String(payload.referenceCode || payload.id || "manual-tx");

    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("complete_payment_order", {
      p_order_code: orderCode,
      p_reference: reference,
    });

    if (error) {
      console.error("[SePay Webhook Error]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = data as any;
    if (!result?.success) {
      return NextResponse.json({ success: false, error: result?.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Order processed and credited successfully",
      creditedAmount: result.credited_amount,
      userId: result.user_id,
    });
  } catch (err: any) {
    console.error("[SePay Webhook Exception]", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
