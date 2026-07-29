import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ChatListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rooms } = await supabase
    .from("chat_rooms")
    .select("id, created_at, product:products(title)")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="text-lg font-bold text-neutral-900 dark:text-white">채팅</h1>

      {!rooms || rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-neutral-500 dark:text-neutral-400">
          <p>아직 채팅이 없어요.</p>
          <p className="mt-1 text-sm">상품 상세에서 판매자에게 채팅을 걸어보세요.</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
          {rooms.map((room) => (
            <li key={room.id}>
              <Link
                href={`/chat/${room.id}`}
                className="block py-3 text-sm text-neutral-700 hover:text-brand-600 dark:text-neutral-300 dark:hover:text-brand-400"
              >
                {room.product?.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
