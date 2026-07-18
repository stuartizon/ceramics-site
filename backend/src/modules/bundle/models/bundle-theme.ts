import { model } from "@medusajs/framework/utils"
import Bundle from "./bundle"

const BundleTheme = model.define("bundle_theme", {
  id: model.id().primaryKey(),
  name: model.text(),
  rank: model.number().default(0),
  items: model.json(),
  bundle: model.belongsTo(() => Bundle, { mappedBy: "themes" }),
})

export default BundleTheme
