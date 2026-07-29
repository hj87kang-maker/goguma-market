"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPaymentAction(formData: FormData) {
  const productId = formData.get("productId") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, price, seller_id, status")
    .eq("id", productId)
    .maybeSingle();

  if (!product || product.status !== "selling" || product.seller_id === user.id) {
    redirect(`/products/${productId}`);
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      product_id: product.id,
      buyer_id: user.id,
      seller_id: product.seller_id,
      amount: product.price,
    })
    .select("id")
    .single();

  if (error || !payment) {
    redirect(`/products/${productId}`);
  }

  redirect(`/checkout/${payment.id}`);
}
