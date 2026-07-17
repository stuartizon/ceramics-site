import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BUNDLE_MODULE } from "../../../../modules/bundle"

type PostBundleBody = {
  handle?: string
  title?: string
  description?: string | null
  thumbnail?: string | null
  status?: "draft" | "published"
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

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

  const bundle = bundles[0]

  if (!bundle) {
    res.status(404).json({ message: "Bundle not found" })
    return
  }

  res.json({ bundle })
}

export async function POST(
  req: MedusaRequest<PostBundleBody>,
  res: MedusaResponse
) {
  const { id } = req.params
  const bundleModuleService = req.scope.resolve(BUNDLE_MODULE)

  const bundle = await bundleModuleService.updateBundles({
    id,
    ...req.body,
  })

  res.json({ bundle })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
  const bundleModuleService = req.scope.resolve(BUNDLE_MODULE)

  const { data: bundles } = await query.graph({
    entity: "bundle",
    fields: ["id", "products.id"],
    filters: { id },
  })

  const bundle = bundles[0]

  if (bundle?.products?.length) {
    await link.dismiss(
      bundle.products
        .filter((product): product is NonNullable<typeof product> => !!product)
        .map((product) => ({
          [BUNDLE_MODULE]: { bundle_id: id },
          [Modules.PRODUCT]: { product_id: product.id },
        }))
    )
  }

  await bundleModuleService.deleteBundles([id])

  res.status(200).json({ id, object: "bundle", deleted: true })
}
