import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

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
      "products.handle",
      "images.id",
      "images.url",
      "images.rank",
    ],
    filters: { status: "published" },
  })

  res.json({ bundles })
}
