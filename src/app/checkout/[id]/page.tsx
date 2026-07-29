import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TossCheckout } from "@/components/toss-checkout";
import { formatPrice } from "@/lib/format";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .single();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount, status, product:products(id, title)")
    .eq("id", id)
    .maybeSingle();

  if (!payment || !payment.product) {
    notFound();
  }

  if (payment.status !== "pending") {
    redirect(`/payments/${payment.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
      <h1 className="text-lg font-bold text-neutral-900 dark:text-white">결제하기</h1>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{payment.product.title}</p>
        <p className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
          {formatPrice(payment.amount)}
        </p>
      </div>

      <div className="mt-6">
        <TossCheckout
          paymentId={payment.id}
          amount={payment.amount}
          orderName={payment.product.title}
          customerKey={user.id}
          customerEmail={user.email ?? ""}
          customerName={profile?.nickname ?? "구매자"}
        />
      </div>
    </div>
  );
}
