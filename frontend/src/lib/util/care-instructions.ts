import { HttpTypes } from "@medusajs/types"

export const CARE_CATEGORIES: Record<
  string,
  { label: string; instructions: string }
> = {
  Textiles: {
    label: "Textile Care",
    instructions: `Machine wash cold on a gentle cycle with like colours. Use mild detergent without optical brighteners. Avoid tumble drying to preserve colour. Turn inside out when possible. Cool iron only if needed.`,
  },
  Ceramics: {
    label: "Ceramic Care",
    instructions:
      "Dishwasher safe, oven warming safe. Not recommended for the microwave.",
  },
}

export const getCareCategoryKey = (
  product: HttpTypes.StoreProduct
): string | null => {
  for (const category of product.categories ?? []) {
    if (CARE_CATEGORIES[category.name]) {
      return category.name
    }
    if (
      category.parent_category &&
      CARE_CATEGORIES[category.parent_category.name]
    ) {
      return category.parent_category.name
    }
  }
  return null
}

export const getCareInstructions = (
  product: HttpTypes.StoreProduct
): string | null => {
  const key = getCareCategoryKey(product)
  return key ? CARE_CATEGORIES[key].instructions : null
}
