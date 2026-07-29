import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { PRODUCT_STATUS_BADGE_CLASS, PRODUCT_STATUS_LABEL } from "@/lib/product-status";
import { firstImageUrl } from "@/lib/products";
import { createPaymentAction } from "@/app/payments/actions";
import { ChatMessages } from "@/components/chat-messages";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: room } = await supabase
    .from("chat_rooms")
    .select(
      "id, buyer_id, seller_id, product:products(id, title, price, status, product_images(url, sort_order)), buyer:profiles!chat_rooms_buyer_id_fkey(id, nickname), seller:profiles!chat_rooms_seller_id_fkey(id, nickname)",
    )
    .eq("id", roomId)
    .maybeSingle();

  if (!room || !room.product || (user.id !== room.buyer_id && user.id !== room.seller_id)) {
    notFound();
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, sender_id, created_at")
    .eq("chat_room_id", roomId)
    .order("created_at", { ascending: true });

  const isBuyer = user.id === room.buyer_id;
  const otherNickname = (isBuyer ? room.seller?.nickname : room.buyer?.nickname) ?? "상대방";
  const canBuy = isBuyer && room.product.status === "selling";
  const thumbnail = firstImageUrl(room.product.product_images);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-4">
      <div className="flex items-center gap-3">
        <Link
          href="/chat"
          className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          ← 채팅목록
        </Link>
        <h1 className="text-sm font-semibold text-neutral-900 dark:text-white">{otherNickname}</h1>
      </div>

      <Link
        href={`/products/${room.product.id}`}
        className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
          {thumbnail && (
            <Image src={thumbnail} alt={room.product.title} fill sizes="56px" className="object-cover" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">{room.product.title}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {formatPrice(room.product.price)}
          </p>
        </div>
        <span
          className={`h-fit rounded-full px-2 py-0.5 text-xs font-medium ${PRODUCT_STATUS_BADGE_CLASS[room.product.status]}`}
        >
          {PRODUCT_STATUS_LABEL[room.product.status]}
        </span>
      </Link>

      {canBuy && (
        <form action={createPaymentAction} className="mt-3">
          <input type="hidden" name="productId" value={room.product.id} />
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            구매하기
          </button>
        </form>
      )}

      <ChatMessages roomId={room.id} currentUserId={user.id} initialMessages={messages ?? []} />
    </div>
  );
}
