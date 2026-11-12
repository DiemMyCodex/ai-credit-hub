import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateVietQRUrl, DEPOSIT_TIERS } from "@/lib/vietqr";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || amount < 10000) {
      return NextResponse.json({ error: "Số tiền tối thiểu là 10,000 VND" }, { status: 400 });
    }

    const tier = DEPOSIT_TIERS.find((t) => t.amount === amount);
    const bonusCredit = tier ? tier.bonusCredit : 0;
    const totalCredit = amount + bonusCredit;

    // Generate unique random order code like AIHUB98214
    const prefix = process.env.NEXT_PUBLIC_TRANSFER_PREFIX || "AIHUB";
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const orderCode = `${prefix}${randomSuffix}`;

    const { data: order, error } = await supabase
      .from("payment_orders")
      .insert({
        user_id: user.id,
        order_code: orderCode,
        amount_vnd: amount,
        bonus_credit: bonusCredit,
        total_credit: totalCredit,
        status: "pending",
      })
      .select()
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Không thể tạo đơn hàng" }, { status: 500 });
    }

    const qrUrl = generateVietQRUrl({
      bankId: process.env.NEXT_PUBLIC_BANK_NAME || "MBBank",
      accountNo: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "0987654321",
      accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "NGUYEN VAN A",
      amount,
      orderCode,
    });

    return NextResponse.json({
      order,
      qrUrl,
      bank: {
        bankName: process.env.NEXT_PUBLIC_BANK_NAME || "MBBank",
        accountNo: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "0987654321",
        accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "NGUYEN VAN A",
        content: orderCode,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
