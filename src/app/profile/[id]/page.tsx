import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { firstImageUrl } from "@/lib/products";
import { signOutAction } from "@/app/auth/actions";

type Tab = "selling" | "sold" | "purchased" | "groups";

const TABS: { key: Tab; label: string }[] = [
  { key: "selling", label: "판매중" },
  { key: "sold", label: "판매완료" },
  { key: "purchased", label: "구매내역" },
  { key: "groups", label: "소모임" },
];

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nickname, neighborhood_name, avatar_url")
    .eq("id", id)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwnProfile = user?.id === profile.id;

  const activeTab: Tab = TABS.some((t) => t.key === tab) ? (tab as Tab) : "selling";

  let cards: ProductCardData[] = [];
  let groups: { id: string; name: string; neighborhood_name: string; category: string | null }[] = [];

  if (activeTab === "groups") {
    const { data } = await supabase
      .from("group_members")
      .select("group:groups(id, name, neighborhood_name, category)")
      .eq("user_id", profile.id)
      .eq("status", "approved");

    groups = (data ?? [])
      .map((row) => row.group)
      .filter((g): g is NonNullable<typeof g> => g !== null);
  } else {
    let query = supabase
      .from("products")
      .select(
        "id, title, price, status, neighborhood_name, created_at, product_images(url, sort_order)",
      )
      .order("created_at", { ascending: false });

    if (activeTab === "selling") {
      query = query.eq("seller_id", profile.id).in("status", ["selling", "reserved"]);
    } else if (activeTab === "sold") {
      query = query.eq("seller_id", profile.id).eq("status", "sold");
    } else {
      query = query.eq("buyer_id", profile.id);
    }

    const { data } = await query;

    cards = (data ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      status: p.status,
      neighborhood_name: p.neighborhood_name,
      created_at: p.created_at,
      imageUrl: firstImageUrl(p.product_images),
    }));
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
          {profile.nickname.slice(0, 1)}
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
            {profile.nickname}
          </h1>
          {profile.neighborhood_name && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {profile.neighborhood_name}
            </p>
          )}
        </div>
        {isOwnProfile && (
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              로그아웃
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/profile/${profile.id}?tab=${t.key}`}
            className={`px-3 py-2.5 text-sm font-medium ${
              activeTab === t.key
                ? "border-b-2 border-brand-600 text-brand-600 dark:text-brand-400"
                : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === "groups" ? (
          groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-neutral-500 dark:text-neutral-400">
              <p>가입한 소모임이 없어요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <p className="font-medium text-neutral-900 dark:text-white">{g.name}</p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {g.category ? `${g.category} · ` : ""}
                    {g.neighborhood_name}
                  </p>
                </div>
              ))}
            </div>
          )
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-neutral-500 dark:text-neutral-400">
            <p>표시할 상품이 없어요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {cards.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
