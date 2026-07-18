import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"

type PostBundleLineItemsBody = {
  bundle_id: string
  theme_id?: string
  quantity?: number
}

type BundleThemeItem = { product_id: string; variant_id: string }

export async function POST(
  req: MedusaRequest<PostBundleLineItemsBody>,
  res: MedusaResponse
) {
  const { id: cartId } = req.params
  const { bundle_id, theme_id, quantity = 1 } = req.body

  if (!bundle_id) {
    res.status(400).json({ message: "bundle_id is required" })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: bundles } = await query.graph({
    entity: "bundle",
    fields: [
      "id",
      "products.id",
      "products.variants.id",
      "themes.id",
      "themes.rank",
      "themes.items",
    ],
    filters: { id: bundle_id },
  })

  const bundle = bundles[0]

  if (!bundle || !bundle.products?.length) {
    res.status(404).json({ message: "Bundle not found" })
    return
  }

  const themes = bundle.themes ?? []
  const selectedTheme = theme_id
    ? themes.find((theme) => theme?.id === theme_id)
    : [...themes]
        .filter((theme): theme is NonNullable<typeof theme> => !!theme)
        .sort((a, b) => a.rank - b.rank)[0]

  const themeItems = (selectedTheme?.items ?? []) as BundleThemeItem[]

  const items = themeItems.length
    ? themeItems.map((item) => ({
        variant_id: item.variant_id,
        quantity,
        metadata: { bundle_id, theme_id: selectedTheme?.id },
      }))
    : (bundle.products ?? [])
        .filter(
          (product): product is NonNullable<typeof product> & { variants: { id: string }[] } =>
            Boolean(product?.variants?.length)
        )
        .map((product) => ({
          variant_id: product.variants[0].id,
          quantity,
          metadata: { bundle_id },
        }))

  await addToCartWorkflow(req.scope).run({
    input: {
      cart_id: cartId,
      items,
    },
  })

  res.json({ success: true })
}
