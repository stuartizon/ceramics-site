import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BUNDLE_MODULE } from "../../../../../modules/bundle"

type PostBundleProductsBody = {
  add?: string[]
  remove?: string[]
}

export async function POST(
  req: MedusaRequest<PostBundleProductsBody>,
  res: MedusaResponse
) {
  const { id } = req.params
  const { add = [], remove = [] } = req.body

  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  if (add.length) {
    await link.create(
      add.map((productId) => ({
        [BUNDLE_MODULE]: { bundle_id: id },
        [Modules.PRODUCT]: { product_id: productId },
      }))
    )
  }

  if (remove.length) {
    await link.dismiss(
      remove.map((productId) => ({
        [BUNDLE_MODULE]: { bundle_id: id },
        [Modules.PRODUCT]: { product_id: productId },
      }))
    )
  }

  const { data: bundles } = await query.graph({
    entity: "bundle",
    fields: [
      "id",
      "handle",
      "title",
      "description",
      "thumbnail",
      "status",
      "products.id",
      "products.title",
      "products.handle",
      "products.thumbnail",
    ],
    filters: { id },
  })

  res.json({ bundle: bundles[0] })
}
