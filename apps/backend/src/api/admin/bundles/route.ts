import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BUNDLE_MODULE } from "../../../modules/bundle"

type PostBundleBody = {
  handle: string
  title: string
  description?: string | null
  thumbnail?: string | null
  status?: "draft" | "published"
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
    ],
  })

  res.json({ bundles, count: bundles.length })
}

export async function POST(
  req: MedusaRequest<PostBundleBody>,
  res: MedusaResponse
) {
  const bundleModuleService = req.scope.resolve(BUNDLE_MODULE)

  const bundle = await bundleModuleService.createBundles(req.body)

  res.json({ bundle })
}
