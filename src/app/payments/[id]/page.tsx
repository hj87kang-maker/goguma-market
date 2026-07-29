import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export default async function PaymentResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, status, amount, fail_message, product:products(id, title)")
    .eq("id", id)
    .maybeSingle();

  if (!payment || !payment.product) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      {payment.status === "done" && (
        <>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            결제가 완료됐어요
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {payment.product.title} · {formatPrice(payment.amount)}
          </p>
          <Link
            href={`/products/${payment.product.id}`}
            className="mt-6 font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            상품 보러가기
          </Link>
        </>
      )}

      {payment.status === "failed" && (
        <>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            결제에 실패했어요
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {payment.fail_message ?? "알 수 없는 오류가 발생했습니다."}
          </p>
          <Link
            href={`/products/${payment.product.id}`}
            className="mt-6 font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            상품으로 돌아가서 다시 시도하기
          </Link>
        </>
      )}

      {payment.status === "pending" && (
        <p className="text-neutral-600 dark:text-neutral-400">결제를 처리하고 있어요...</p>
      )}
    </div>
  );
}
