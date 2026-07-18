import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BUNDLE_MODULE } from "../../../../../modules/bundle"

type BundleThemeItem = { product_id: string; variant_id: string }

type PostBundleThemeBody = {
  name: string
  items: BundleThemeItem[]
}

export async function POST(
  req: MedusaRequest<PostBundleThemeBody>,
  res: MedusaResponse
) {
  const { id } = req.params
  const { name, items } = req.body

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const bundleModuleService = req.scope.resolve(BUNDLE_MODULE)

  const { data: existingBundles } = await query.graph({
    entity: "bundle",
    fields: ["id", "themes.id"],
    filters: { id },
  })

  const rank = existingBundles[0]?.themes?.length ?? 0

  await bundleModuleService.createBundleThemes({
    bundle_id: id,
    name,
    rank,
    items: items as unknown as Record<string, unknown>,
  })

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
      "themes.id",
      "themes.name",
      "themes.rank",
      "themes.items",
    ],
    filters: { id },
  })

  res.json({ bundle: bundles[0] })
}
