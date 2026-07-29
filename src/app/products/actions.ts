"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateProductState = { error: string | null };

export async function createProductAction(
  _prevState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = (formData.get("title") as string ?? "").trim();
  const description = (formData.get("description") as string ?? "").trim();
  const neighborhoodName = (formData.get("neighborhoodName") as string ?? "").trim();
  const categoryId = Number(formData.get("categoryId"));
  const price = Number(formData.get("price"));
  const images = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (!title || !description || !neighborhoodName) {
    return { error: "모든 필드를 입력해주세요." };
  }
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { error: "카테고리를 선택해주세요." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "가격을 올바르게 입력해주세요." };
  }
  if (images.length === 0) {
    return { error: "사진을 1장 이상 등록해주세요." };
  }

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      seller_id: user.id,
      category_id: categoryId,
      title,
      description,
      price,
      neighborhood_name: neighborhoodName,
    })
    .select("id")
    .single();

  if (insertError || !product) {
    return { error: "상품 등록 중 문제가 발생했습니다." };
  }

  for (const [index, file] of images.entries()) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${product.id}/${index}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type });

    if (uploadError) continue;

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(path);

    await supabase.from("product_images").insert({
      product_id: product.id,
      url: publicUrl,
      sort_order: index,
    });
  }

  redirect(`/products/${product.id}`);
}
