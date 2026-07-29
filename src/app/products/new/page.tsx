import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "./product-form";

export default async function NewProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("id");

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
      <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
        상품 등록
      </h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        판매하고 싶은 물건 정보를 입력해주세요
      </p>

      <ProductForm categories={categories ?? []} />
    </div>
  );
}
