import { MedusaService } from "@medusajs/framework/utils"
import Bundle from "./models/bundle"
import BundleImage from "./models/bundle-image"
import BundleTheme from "./models/bundle-theme"

class BundleModuleService extends MedusaService({
  Bundle,
  BundleImage,
  BundleTheme,
}) {}

export default BundleModuleService
