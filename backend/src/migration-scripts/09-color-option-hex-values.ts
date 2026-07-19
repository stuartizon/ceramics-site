import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductOptionValuesWorkflow } from "@medusajs/medusa/core-flows";

// Storefront swatches (frontend/src/modules/store/components/refinement-list/
// options-picker/index.tsx) read a hex code from each Color option value's
// metadata to render a color square instead of a text label. These are
// approximations of multi-color/patterned glazes, chosen to represent each
// glaze's dominant tone - adjust freely via Admin > Product Options > Color >
// [value] > Edit metadata.
const HEX_BY_COLOR_VALUE: Record<string, string> = {
  "Blue Mixed Pattern": "#3E6690",
  "Marine Mixed Pattern": "#1F3B4D",
  "Pink Mixed Pattern": "#D98CA0",
  "Sage on White": "#F5F2E9",
  "White on Sage": "#A9B98C",
};

export default async function addColorOptionHexValues({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Adding hex values to Color option values...");

  const { data: colorOptions } = await query.graph({
    entity: "product_option",
    fields: ["id", "values.id", "values.value", "values.metadata"],
    filters: { title: "Color", is_exclusive: false },
  });

  if (!colorOptions.length) {
    logger.info("No shared Color option found - nothing to do.");
    return;
  }

  for (const option of colorOptions) {
    for (const value of option.values ?? []) {
      const hex = HEX_BY_COLOR_VALUE[value.value];

      if (!hex) {
        logger.warn(
          `No hex mapping for Color value "${value.value}" (${value.id}) - skipping.`
        );
        continue;
      }

      await updateProductOptionValuesWorkflow(container).run({
        input: {
          id: value.id,
          update: { metadata: { ...(value.metadata ?? {}), hex } },
        },
      });
    }
  }

  logger.info("Finished adding hex values to Color option values.");
}
