import { model } from "@medusajs/framework/utils"
import Bundle from "./bundle"

const BundleImage = model.define("bundle_image", {
  id: model.id().primaryKey(),
  url: model.text(),
  rank: model.number().default(0),
  bundle: model.belongsTo(() => Bundle, { mappedBy: "images" }),
})

export default BundleImage
