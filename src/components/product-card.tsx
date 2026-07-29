import Image from "next/image";
import Link from "next/link";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { PRODUCT_STATUS_BADGE_CLASS, PRODUCT_STATUS_LABEL } from "@/lib/product-status";
import type { Enums } from "@/lib/supabase/types";

export type ProductCardData = {
  id: string;
  title: string;
  price: number;
  status: Enums<"product_status">;
  neighborhood_name: string;
  created_at: string;
  imageUrl: string | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const isSold = product.status === "sold";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className={`object-cover transition-transform group-hover:scale-105 ${isSold ? "opacity-60" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            이미지 없음
          </div>
        )}
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${PRODUCT_STATUS_BADGE_CLASS[product.status]}`}
        >
          {PRODUCT_STATUS_LABEL[product.status]}
        </span>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <h3 className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
          {product.title}
        </h3>
        <p className="text-base font-bold text-neutral-900 dark:text-white">
          {formatPrice(product.price)}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {product.neighborhood_name} · {formatRelativeTime(product.created_at)}
        </p>
      </div>
    </Link>
  );
}
