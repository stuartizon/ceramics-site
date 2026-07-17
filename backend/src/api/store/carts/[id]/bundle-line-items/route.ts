import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"

type PostBundleLineItemsBody = {
  bundle_id: string
  quantity?: number
}

export async function POST(
  req: MedusaRequest<PostBundleLineItemsBody>,
  res: MedusaResponse
) {
  const { id: cartId } = req.params
  const { bundle_id, quantity = 1 } = req.body

  if (!bundle_id) {
    res.status(400).json({ message: "bundle_id is required" })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: bundles } = await query.graph({
    entity: "bundle",
    fields: ["id", "products.id", "products.variants.id"],
    filters: { id: bundle_id },
  })

  const bundle = bundles[0]

  if (!bundle || !bundle.products?.length) {
    res.status(404).json({ message: "Bundle not found" })
    return
  }

  const items = (bundle.products ?? [])
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
