import { MedusaService } from "@medusajs/framework/utils"
import Bundle from "./models/bundle"
import BundleImage from "./models/bundle-image"

class BundleModuleService extends MedusaService({
  Bundle,
  BundleImage,
}) {}

export default BundleModuleService
