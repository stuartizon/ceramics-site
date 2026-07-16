import { model } from "@medusajs/framework/utils"

const Bundle = model.define("bundle", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  title: model.text(),
  description: model.text().nullable(),
  thumbnail: model.text().nullable(),
  status: model.enum(["draft", "published"]).default("draft"),
})

export default Bundle
