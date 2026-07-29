import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { firstImageUrl } from "@/lib/products";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("id");

  const activeCategory = categories?.find((c) => c.slug === categorySlug);

  let query = supabase
    .from("products")
    .select(
      "id, title, price, status, neighborhood_name, created_at, product_images(url, sort_order)",
    )
    .order("created_at", { ascending: false });

  if (activeCategory) {
    query = query.eq("category_id", activeCategory.id);
  }

  const { data: products } = await query;

  const cards: ProductCardData[] = (products ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    status: p.status,
    neighborhood_name: p.neighborhood_name,
    created_at: p.created_at,
    imageUrl: firstImageUrl(p.product_images),
  }));

  return (
    <div className="flex flex-1 flex-col bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link
            href="/"
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
              !activeCategory
                ? "bg-brand-600 text-white"
                : "border border-neutral-200 bg-white text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            }`}
          >
            전체
          </Link>
          {categories?.map((c) => (
            <Link
              key={c.id}
              href={`/?category=${c.slug}`}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
                activeCategory?.id === c.id
                  ? "bg-brand-600 text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-neutral-500 dark:text-neutral-400">
            <p>아직 등록된 상품이 없어요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {cards.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Link
        href="/products/new"
        className="fixed bottom-20 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg transition-colors hover:bg-brand-700"
        aria-label="상품 등록"
      >
        +
      </Link>
    </div>
  );
}
