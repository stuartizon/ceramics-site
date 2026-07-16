import { MedusaService } from "@medusajs/framework/utils"
import Bundle from "./models/bundle"

class BundleModuleService extends MedusaService({
  Bundle,
}) {}

export default BundleModuleService
