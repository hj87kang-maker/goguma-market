"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startChatAction(formData: FormData) {
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
    .select("id, seller_id")
    .eq("id", productId)
    .maybeSingle();

  if (!product || product.seller_id === user.id) {
    redirect(`/products/${productId}`);
  }

  const { data: existingRoom } = await supabase
    .from("chat_rooms")
    .select("id")
    .eq("product_id", productId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (existingRoom) {
    redirect(`/chat/${existingRoom.id}`);
  }

  const { data: room, error } = await supabase
    .from("chat_rooms")
    .insert({
      product_id: product.id,
      buyer_id: user.id,
      seller_id: product.seller_id,
    })
    .select("id")
    .single();

  if (error || !room) {
    redirect(`/products/${productId}`);
  }

  redirect(`/chat/${room.id}`);
}

export async function sendMessageAction(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const content = ((formData.get("content") as string) ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!content) {
    return;
  }

  await supabase.from("messages").insert({
    chat_room_id: roomId,
    sender_id: user.id,
    content,
  });
}
