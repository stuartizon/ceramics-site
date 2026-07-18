import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BUNDLE_MODULE } from "../../../../modules/bundle"

type PostBundleBody = {
  handle?: string
  title?: string
  description?: string | null
  thumbnail?: string | null
  status?: "draft" | "published"
  images?: { id?: string; url: string }[]
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
      "images.id",
      "images.url",
      "images.rank",
      "themes.id",
      "themes.name",
      "themes.rank",
      "themes.items",
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
  const { images, ...bundleData } = req.body
  const bundleModuleService = req.scope.resolve(BUNDLE_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  await bundleModuleService.updateBundles({ id, ...bundleData })

  if (images) {
    const { data: existingBundles } = await query.graph({
      entity: "bundle",
      fields: ["id", "images.id"],
      filters: { id },
    })

    const existingImageIds = (existingBundles[0]?.images ?? [])
      .filter((image): image is NonNullable<typeof image> => !!image)
      .map((image) => image.id)
    const incomingImageIds = images
      .filter((image) => image.id)
      .map((image) => image.id as string)

    const imageIdsToDelete = existingImageIds.filter(
      (imageId) => !incomingImageIds.includes(imageId)
    )
    if (imageIdsToDelete.length) {
      await bundleModuleService.deleteBundleImages(imageIdsToDelete)
    }

    for (const [index, image] of images.entries()) {
      if (image.id) {
        await bundleModuleService.updateBundleImages({
          id: image.id,
          url: image.url,
          rank: index,
        })
      } else {
        await bundleModuleService.createBundleImages({
          url: image.url,
          rank: index,
          bundle_id: id,
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
      "images.id",
      "images.url",
      "images.rank",
      "themes.id",
      "themes.name",
      "themes.rank",
      "themes.items",
    ],
    filters: { id },
  })

  res.json({ bundle: bundles[0] })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
  const bundleModuleService = req.scope.resolve(BUNDLE_MODULE)

  const { data: bundles } = await query.graph({
    entity: "bundle",
    fields: ["id", "products.id", "images.id"],
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

  if (bundle?.images?.length) {
    await bundleModuleService.deleteBundleImages(
      bundle.images
        .filter((image): image is NonNullable<typeof image> => !!image)
        .map((image) => image.id)
    )
  }

  await bundleModuleService.deleteBundles([id])

  res.status(200).json({ id, object: "bundle", deleted: true })
}
