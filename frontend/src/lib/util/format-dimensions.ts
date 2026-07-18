import { HttpTypes } from "@medusajs/types"

export const formatDimensions = (
  product: HttpTypes.StoreProduct
): string | null => {
  const parts = [
    product.length ? `${product.length}cm (L)` : null,
    product.width ? `${product.width}cm (W)` : null,
    product.height ? `${product.height}cm (H)` : null,
  ].filter(Boolean)

  return parts.length ? parts.join(" x ") : null
}
