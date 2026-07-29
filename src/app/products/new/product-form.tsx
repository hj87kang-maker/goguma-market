"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { createProductAction, type CreateProductState } from "../actions";

const initialState: CreateProductState = { error: null };

const fieldClass =
  "rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-neutral-700 dark:bg-neutral-800";

export function ProductForm({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createProductAction,
    initialState,
  );
  const [previews, setPreviews] = useState<string[]>([]);

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    previews.forEach((url) => URL.revokeObjectURL(url));

    const files = Array.from(event.target.files ?? []);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          사진 (최대 5장)
        </label>
        <input
          name="images"
          type="file"
          accept="image/*"
          multiple
          required
          onChange={handleImagesChange}
          className="text-sm text-neutral-600 dark:text-neutral-400"
        />
        {previews.length > 0 && (
          <div className="mt-1 flex gap-2 overflow-x-auto">
            {previews.map((url, i) => (
              <div
                key={url}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
              >
                <Image
                  src={url}
                  alt={`미리보기 ${i + 1}`}
                  fill
                  sizes="80px"
                  unoptimized
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="categoryId" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          카테고리
        </label>
        <select id="categoryId" name="categoryId" required className={fieldClass}>
          <option value="">카테고리 선택</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={60}
          placeholder="예: 아이폰 14 프로 256GB"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="price" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          가격 (원)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          required
          min={0}
          step={100}
          placeholder="0"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          설명
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          placeholder="상품 상태, 거래 방식 등을 자세히 적어주세요"
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="neighborhoodName" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          거래 희망 지역
        </label>
        <input
          id="neighborhoodName"
          name="neighborhoodName"
          type="text"
          required
          placeholder="예: 서울 마포구 합정동"
          className={fieldClass}
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "등록 중..." : "등록하기"}
      </button>
    </form>
  );
}
