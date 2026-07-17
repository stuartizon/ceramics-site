import BundleModule from "../modules/bundle"
import ProductModule from "@medusajs/medusa/product"
import { defineLink } from "@medusajs/framework/utils"

export default defineLink(
  { linkable: BundleModule.linkable.bundle, isList: true },
  { linkable: ProductModule.linkable.product, isList: true }
)
