import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BUNDLE_MODULE } from "../../../../../../modules/bundle"

type BundleThemeItem = { product_id: string; variant_id: string }

type PostBundleThemeBody = {
  name?: string
  rank?: number
  items?: BundleThemeItem[]
}

const bundleFields = [
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
]

export async function POST(
  req: MedusaRequest<PostBundleThemeBody>,
  res: MedusaResponse
) {
  const { id, themeId } = req.params
  const bundleModuleService = req.scope.resolve(BUNDLE_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { items, ...rest } = req.body

  await bundleModuleService.updateBundleThemes({
    id: themeId,
    ...rest,
    ...(items ? { items: items as unknown as Record<string, unknown> } : {}),
  })

  const { data: bundles } = await query.graph({
    entity: "bundle",
    fields: bundleFields,
    filters: { id },
  })

  res.json({ bundle: bundles[0] })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id, themeId } = req.params
  const bundleModuleService = req.scope.resolve(BUNDLE_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  await bundleModuleService.deleteBundleThemes([themeId])

  const { data: bundles } = await query.graph({
    entity: "bundle",
    fields: bundleFields,
    filters: { id },
  })

  res.json({ bundle: bundles[0] })
}
