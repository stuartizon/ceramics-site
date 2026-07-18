import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BUNDLE_MODULE } from "../../../../../modules/bundle"

type PostBundleProductsBody = {
  add?: string[]
  remove?: string[]
}

type BundleThemeItem = { product_id: string; variant_id: string }

export async function POST(
  req: MedusaRequest<PostBundleProductsBody>,
  res: MedusaResponse
) {
  const { id } = req.params
  const { add = [], remove = [] } = req.body

  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const bundleModuleService = req.scope.resolve(BUNDLE_MODULE)

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

    const { data: themeBundles } = await query.graph({
      entity: "bundle",
      fields: ["id", "themes.id", "themes.items"],
      filters: { id },
    })

    for (const theme of themeBundles[0]?.themes ?? []) {
      if (!theme) continue

      const items = (theme.items ?? []) as unknown as BundleThemeItem[]
      const filteredItems = items.filter(
        (item) => !remove.includes(item.product_id)
      )

      if (filteredItems.length !== items.length) {
        await bundleModuleService.updateBundleThemes({
          id: theme.id,
          items: filteredItems as unknown as Record<string, unknown>,
        })
      }
    }
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
      "themes.id",
      "themes.name",
      "themes.rank",
      "themes.items",
    ],
    filters: { id },
  })

  res.json({ bundle: bundles[0] })
}
