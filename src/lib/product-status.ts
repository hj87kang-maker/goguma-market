import type { Enums } from "@/lib/supabase/types";

export const PRODUCT_STATUS_LABEL: Record<Enums<"product_status">, string> = {
  selling: "판매중",
  reserved: "예약중",
  sold: "거래완료",
};

export const PRODUCT_STATUS_BADGE_CLASS: Record<Enums<"product_status">, string> = {
  selling: "bg-brand-600 text-white",
  reserved: "bg-amber-500 text-white",
  sold: "bg-neutral-500 text-white",
};
