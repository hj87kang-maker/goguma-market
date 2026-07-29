import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/product-gallery";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { PRODUCT_STATUS_BADGE_CLASS, PRODUCT_STATUS_LABEL } from "@/lib/product-status";
import { createPaymentAction } from "@/app/payments/actions";
import { startChatAction } from "@/app/chat/actions";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, title, description, price, status, neighborhood_name, created_at, category:categories(name), seller:profiles!products_seller_id_fkey(id, nickname), product_images(url, sort_order)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const canBuy = product.status === "selling" && user?.id !== product.seller?.id;
  const canChat = user?.id !== product.seller?.id;

  const images = [...(product.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.url);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <Link
        href="/"
        className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
      >
        ← 목록으로
      </Link>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <ProductGallery images={images} title={product.title} />

        <div className="flex flex-col gap-3">
          <div>
            <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
              {product.category?.name}
            </span>
            <h1 className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
              {product.title}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {product.neighborhood_name} · {formatRelativeTime(product.created_at)}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${PRODUCT_STATUS_BADGE_CLASS[product.status]}`}
          >
            {PRODUCT_STATUS_LABEL[product.status]}
          </span>

          <p className="text-2xl font-bold text-neutral-900 dark:text-white">
            {formatPrice(product.price)}
          </p>

          {(canChat || canBuy) && (
            <div className="flex gap-2">
              {canChat && (
                <form action={startChatAction} className="flex-1">
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-brand-600 px-4 py-2.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-neutral-900"
                  >
                    채팅하기
                  </button>
                </form>
              )}
              {canBuy && (
                <form action={createPaymentAction} className="flex-1">
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                  >
                    구매하기
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {product.description}
          </p>

          <div className="mt-2 border-t border-neutral-200 pt-3 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
            판매자{" "}
            {product.seller && (
              <Link
                href={`/profile/${product.seller.id}`}
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                {product.seller.nickname}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
