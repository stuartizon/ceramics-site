import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createProductOptionsWorkflow,
  deleteProductOptionsWorkflow,
  setProductProductOptionsWorkflow,
} from "@medusajs/medusa/core-flows";

// "Color" was originally created per-product (04-product-pasta-bowl,
// 05-product-tea-towel), which makes each instance exclusive to its own
// product instead of a shared option like Size/Glaze. This folds every
// exclusive "Color" option into one shared option, re-pointing existing
// variants at it, so future products can reuse the same option instead of
// creating their own.
export default async function consolidateColorOption({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const knex = container.resolve(ContainerRegistrationKeys.PG_CONNECTION);

  logger.info("Consolidating per-product Color options into a shared option...");

  const { data: exclusiveColorOptions } = await query.graph({
    entity: "product_option",
    fields: [
      "id",
      "values.value",
      "products.id",
      "products.variants.id",
      "products.variants.options.id",
      "products.variants.options.value",
    ],
    filters: { title: "Color", is_exclusive: true },
  });

  if (!exclusiveColorOptions.length) {
    logger.info("No exclusive Color options found - nothing to do.");
    return;
  }

  const sharedValues: string[] = [];
  for (const option of exclusiveColorOptions) {
    for (const value of option.values ?? []) {
      if (!sharedValues.includes(value.value)) {
        sharedValues.push(value.value);
      }
    }
  }

  await createProductOptionsWorkflow(container).run({
    input: {
      product_options: [
        { title: "Color", values: sharedValues, is_exclusive: false },
      ],
    },
  });

  const { data: sharedColorOptionResult } = await query.graph({
    entity: "product_option",
    fields: ["id", "values.id", "values.value"],
    filters: { title: "Color", is_exclusive: false },
  });
  const sharedColorOption = sharedColorOptionResult[0];
  const sharedValueIdByValue = new Map(
    sharedColorOption.values.map((value) => [value.value, value.id])
  );

  for (const oldOption of exclusiveColorOptions) {
    for (const product of oldOption.products ?? []) {
      const relevantValueIds = [
        ...new Set(
          product.variants.map(
            (variant) => sharedValueIdByValue.get(variant.options[0].value)!
          )
        ),
      ];

      await setProductProductOptionsWorkflow(container).run({
        input: {
          product_id: product.id,
          add: [
            {
              product_option_id: sharedColorOption.id,
              product_option_value_ids: relevantValueIds,
            },
          ],
        },
      });

      // Medusa has no workflow for moving a variant from one option's value
      // to another's while both options are attached to the product - the
      // variant-update API always requires supplying a value for every
      // option currently on the product, so it can't represent "drop this
      // one". The pivot row is re-pointed directly instead.
      for (const variant of product.variants) {
        const oldValue = variant.options[0];
        const newValueId = sharedValueIdByValue.get(oldValue.value)!;
        await knex("product_variant_option")
          .where({ variant_id: variant.id, option_value_id: oldValue.id })
          .update({ option_value_id: newValueId });
      }

      await setProductProductOptionsWorkflow(container).run({
        input: { product_id: product.id, remove: [oldOption.id] },
      });
    }
  }

  // Cascades to delete the now-unused option values on each exclusive option.
  await deleteProductOptionsWorkflow(container).run({
    input: { ids: exclusiveColorOptions.map((option) => option.id) },
  });

  logger.info("Finished consolidating Color options into a shared option.");
}
