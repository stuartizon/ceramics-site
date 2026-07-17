import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BUNDLE_MODULE } from "../../../modules/bundle"

type PostBundleBody = {
  handle: string
  title: string
  description?: string | null
  thumbnail?: string | null
  status?: "draft" | "published"
  images?: { id?: string; url: string }[]
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
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
      "images.id",
      "images.url",
      "images.rank",
    ],
  })

  res.json({ bundles, count: bundles.length })
}

export async function POST(
  req: MedusaRequest<PostBundleBody>,
  res: MedusaResponse
) {
  const { images, ...bundleData } = req.body
  const bundleModuleService = req.scope.resolve(BUNDLE_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const bundle = await bundleModuleService.createBundles(bundleData)

  if (images?.length) {
    await bundleModuleService.createBundleImages(
      images.map((image, index) => ({
        url: image.url,
        rank: index,
        bundle_id: bundle.id,
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
      "images.id",
      "images.url",
      "images.rank",
    ],
    filters: { id: bundle.id },
  })

  res.json({ bundle: bundles[0] })
}
