import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const orderId = searchParams.get("orderId");
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  if (!orderId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = await createClient();

  await supabase
    .from("payments")
    .update({
      status: "failed",
      fail_code: code,
      fail_message: message,
    })
    .eq("id", orderId)
    .eq("status", "pending");

  return NextResponse.redirect(new URL(`/payments/${orderId}`, request.url));
}
