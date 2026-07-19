import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import { uploadSeedImages } from "./utils/seed-images";

export default async function productPastaBowl({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Seeding Organic Pasta Bowl...");

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
    filters: { name: "Bowls" },
  });
  const bowlsCategory = categoryResult[0];

  // Placeholder photography - see the seed-images comment in
  // utils/seed-images.ts.
  const pastaBowlImageFiles = await uploadSeedImages(container, [
    "organic-pasta-bowl-1.jpg",
    "organic-pasta-bowl-2.jpg",
  ]);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Organic Pasta Bowl",
          category_ids: [bowlsCategory.id],
          description:
            "A round, deep-sided bowl with Wonki Ware’s signature wonkiness. It holds a very generous individual portion of pasta — or can easily be shared between a few friends. Also perfect for hot vegetable sides or Israeli-style quinoa salads.",
          handle: "organic-pasta-bowl",
          length: 21,
          width: 9,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          thumbnail: pastaBowlImageFiles[0].url,
          images: pastaBowlImageFiles.map((file) => ({ url: file.url })),
          options: [
            {
              title: "Color",
              values: [
                "Blue Mixed Pattern",
                "Marine Mixed Pattern",
                "Pink Mixed Pattern",
              ],
            },
          ],
          variants: [
            {
              title: "Blue Mixed Pattern",
              sku: "PASTA-BOWL-BLUE-MIXED-PATTERN",
              options: {
                Color: "Blue Mixed Pattern",
              },
              prices: [
                {
                  amount: 160,
                  currency_code: "ils",
                },
              ],
            },
            {
              title: "Marine Mixed Pattern",
              sku: "PASTA-BOWL-MARINE-MIXED-PATTERN",
              options: {
                Color: "Marine Mixed Pattern",
              },
              prices: [
                {
                  amount: 160,
                  currency_code: "ils",
                },
              ],
            },
            {
              title: "Pink Mixed Pattern",
              sku: "PASTA-BOWL-PINK-MIXED-PATTERN",
              options: {
                Color: "Pink Mixed Pattern",
              },
              prices: [
                {
                  amount: 160,
                  currency_code: "ils",
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

  logger.info("Finished seeding Organic Pasta Bowl.");
}
