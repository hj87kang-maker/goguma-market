type ProductImageRow = { url: string; sort_order: number };

export function firstImageUrl(images: ProductImageRow[] | null | undefined) {
  if (!images || images.length === 0) return null;
  return [...images].sort((a, b) => a.sort_order - b.sort_order)[0].url;
}
