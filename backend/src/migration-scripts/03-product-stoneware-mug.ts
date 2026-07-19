import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";

export default async function productStonewareMug({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Seeding Stoneware Mug...");

  const { data: salesChannelResult } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
    filters: { name: "Emma Ceramics Storefront" },
  });
  const defaultSalesChannel = salesChannelResult[0];

  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const { data: categoryResult } = await query.graph({
    entity: "product_category",
    fields: ["id"],
    filters: { name: "Mugs" },
  });
  const mugsCategory = categoryResult[0];

  const { data: optionResult } = await query.graph({
    entity: "product_option",
    fields: ["id", "title"],
    filters: { title: ["Size", "Glaze"] },
  });
  const sizeOption = optionResult.find((o) => o.title === "Size")!;
  const glazeOption = optionResult.find((o) => o.title === "Glaze")!;

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Stoneware Mug",
          category_ids: [mugsCategory.id],
          description:
            "A handmade stoneware mug, thrown and glazed in the studio. Each piece is unique.",
          handle: "stoneware-mug",
          weight: 350,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [{ id: sizeOption.id }, { id: glazeOption.id }],
          variants: [
            {
              title: "Small / Matte White",
              sku: "MUG-S-MATTE-WHITE",
              options: {
                Size: "Small",
                Glaze: "Matte White",
              },
              prices: [
                {
                  amount: 120,
                  currency_code: "ils",
                },
                {
                  amount: 35,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Small / Speckled Clay",
              sku: "MUG-S-SPECKLED-CLAY",
              options: {
                Size: "Small",
                Glaze: "Speckled Clay",
              },
              prices: [
                {
                  amount: 120,
                  currency_code: "ils",
                },
                {
                  amount: 35,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Medium / Matte White",
              sku: "MUG-M-MATTE-WHITE",
              options: {
                Size: "Medium",
                Glaze: "Matte White",
              },
              prices: [
                {
                  amount: 120,
                  currency_code: "ils",
                },
                {
                  amount: 35,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Medium / Speckled Clay",
              sku: "MUG-M-SPECKLED-CLAY",
              options: {
                Size: "Medium",
                Glaze: "Speckled Clay",
              },
              prices: [
                {
                  amount: 120,
                  currency_code: "ils",
                },
                {
                  amount: 35,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Large / Matte White",
              sku: "MUG-L-MATTE-WHITE",
              options: {
                Size: "Large",
                Glaze: "Matte White",
              },
              prices: [
                {
                  amount: 120,
                  currency_code: "ils",
                },
                {
                  amount: 35,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Large / Speckled Clay",
              sku: "MUG-L-SPECKLED-CLAY",
              options: {
                Size: "Large",
                Glaze: "Speckled Clay",
              },
              prices: [
                {
                  amount: 120,
                  currency_code: "ils",
                },
                {
                  amount: 35,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel.id,
            },
          ],
        },
      ],
    },
  });

  logger.info("Finished seeding Stoneware Mug.");
}
