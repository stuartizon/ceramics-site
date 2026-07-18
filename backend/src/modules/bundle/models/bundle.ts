import { model } from "@medusajs/framework/utils"
import BundleImage from "./bundle-image"
import BundleTheme from "./bundle-theme"

const Bundle = model.define("bundle", {
  id: model.id().primaryKey(),
  handle: model.text().unique(),
  title: model.text(),
  description: model.text().nullable(),
  thumbnail: model.text().nullable(),
  status: model.enum(["draft", "published"]).default("draft"),
  images: model.hasMany(() => BundleImage, { mappedBy: "bundle" }),
  themes: model.hasMany(() => BundleTheme, { mappedBy: "bundle" }),
})

export default Bundle
