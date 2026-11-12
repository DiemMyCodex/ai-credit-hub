import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOrderCode, buildVietQRUrl, TOPUP_TIERS } from "@/lib/payment/vietqr";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tierId } = body;

    const tier = TOPUP_TIERS.find((t) => t.id === tierId) || {
      amountVnd: Number(body.amountVnd) || 50000,
      bonusVnd: 0,
    };

    const orderCode = generateOrderCode();

    const { data: order, error: insertError } = await supabase
      .from("payment_orders")
      .insert({
        user_id: user.id,
        order_code: orderCode,
        amount_vnd: tier.amountVnd,
        bonus_credit: tier.bonusVnd,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const qrUrl = buildVietQRUrl(tier.amountVnd, orderCode);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderCode: order.order_code,
        amountVnd: order.amount_vnd,
        bonusCredit: order.bonus_credit,
        totalCredit: order.amount_vnd + order.bonus_credit,
        qrUrl,
        bankName: process.env.NEXT_PUBLIC_BANK_NAME || "MBBank",
        accountNo: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "0123456789",
        accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "NGUYEN VAN A",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
