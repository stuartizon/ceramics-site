import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  batchVariantImagesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import { uploadSeedImages } from "./utils/seed-images";

export default async function productTeaTowel({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Seeding Floral Kingdom Tea Towel...");

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
    filters: { name: "Tea Towels" },
  });
  const teaTowelsCategory = categoryResult[0];

  // Placeholder photography - see the seed-images comment in
  // utils/seed-images.ts.
  const teaTowelWhiteOnSageImageFiles = await uploadSeedImages(container, [
    "floral-kingdom-tea-towel-white-on-sage-1.jpg",
    "floral-kingdom-tea-towel-white-on-sage-2.jpg",
    "floral-kingdom-tea-towel-white-on-sage-3.jpg",
  ]);
  const teaTowelSageOnWhiteImageFiles = await uploadSeedImages(container, [
    "floral-kingdom-tea-towel-sage-on-white-1.jpg",
    "floral-kingdom-tea-towel-sage-on-white-2.jpg",
  ]);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Floral Kingdom Tea Towel",
          category_ids: [teaTowelsCategory.id],
          description:
            "Our tea towels are lightweight, quick-drying, and full of charm. With vibrant prints, they add colour to the kitchen and personality to even the most practical of chores. Whether draped over the oven handle or laid under warm challah, they bring colour to the everyday.",
          handle: "floral-kingdom-tea-towel",
          material: "Cotton",
          length: 46,
          width: 65,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          thumbnail: teaTowelWhiteOnSageImageFiles[0].url,
          images: [
            ...teaTowelWhiteOnSageImageFiles,
            ...teaTowelSageOnWhiteImageFiles,
          ].map((file) => ({ url: file.url })),
          options: [
            {
              title: "Color",
              values: ["White on Sage", "Sage on White"],
            },
          ],
          variants: [
            {
              title: "White on Sage",
              sku: "TEATOWEL-FLORAL-KINGDOM-WHITE-SAGE",
              options: {
                Color: "White on Sage",
              },
              prices: [
                {
                  amount: 55,
                  currency_code: "ils",
                },
              ],
            },
            {
              title: "Sage on White",
              sku: "TEATOWEL-FLORAL-KINGDOM-SAGE-WHITE",
              options: {
                Color: "Sage on White",
              },
              prices: [
                {
                  amount: 55,
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

  // Link each tea towel color to its own photos so the storefront's color
  // switcher shows the matching variant instead of falling back to the
  // full shared gallery.
  const { data: teaTowelProductResult } = await query.graph({
    entity: "product",
    fields: ["id", "images.id", "images.url", "variants.id", "variants.title"],
    filters: { handle: "floral-kingdom-tea-towel" },
  });
  const teaTowelProduct = teaTowelProductResult[0];
  const imageIdsByUrl = new Map(
    teaTowelProduct.images.map((image) => [image.url, image.id])
  );
  const teaTowelVariantImageFiles: Record<
    string,
    typeof teaTowelWhiteOnSageImageFiles
  > = {
    "White on Sage": teaTowelWhiteOnSageImageFiles,
    "Sage on White": teaTowelSageOnWhiteImageFiles,
  };
  for (const variant of teaTowelProduct.variants) {
    const imageFiles = teaTowelVariantImageFiles[variant.title];
    await batchVariantImagesWorkflow(container).run({
      input: {
        variant_id: variant.id,
        add: imageFiles.map((file) => imageIdsByUrl.get(file.url)!),
      },
    });
  }

  logger.info("Finished seeding Floral Kingdom Tea Towel.");
}
