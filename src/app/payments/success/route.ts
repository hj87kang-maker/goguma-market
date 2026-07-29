import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  if (!paymentKey || !orderId || !amount) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!payment) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 이미 처리된 결제면 승인 API를 다시 호출하지 않고 결과 페이지로 보낸다.
  if (payment.status !== "pending" || payment.amount !== Number(amount)) {
    return NextResponse.redirect(new URL(`/payments/${payment.id}`, request.url));
  }

  const auth = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64");

  const confirmRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount: payment.amount, // successUrl 쿼리 파라미터가 아니라 서버에 저장된 금액을 사용
    }),
  });

  if (confirmRes.ok) {
    await supabase.rpc("confirm_payment_success", {
      payment_id: payment.id,
      toss_payment_key: paymentKey,
    });
  } else {
    const errorData = (await confirmRes.json().catch(() => null)) as
      | { code?: string; message?: string }
      | null;

    await supabase
      .from("payments")
      .update({
        status: "failed",
        fail_code: errorData?.code ?? "CONFIRM_FAILED",
        fail_message: errorData?.message ?? "결제 승인에 실패했습니다.",
      })
      .eq("id", payment.id);
  }

  return NextResponse.redirect(new URL(`/payments/${payment.id}`, request.url));
}
