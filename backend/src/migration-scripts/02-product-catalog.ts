import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";
import { uploadSeedImages } from "./utils/seed-images";

export default async function productCatalog({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  logger.info("Seeding product data...");

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

  const categoryTree: Record<string, string[]> = {
    Ceramics: ["Bowls", "Platters", "Snack Dishes", "Mugs"],
    Textiles: [
      "Tablecloths",
      "Runners",
      "Oven Gloves",
      "Aprons",
      "Pot Holders",
      "Tea Towels",
    ],
    "Home Decor": ["Giraffes"],
    Accessories: ["Earrings"],
    "Artisanal Eats": ["Spice Blends", "Honeys"],
  };

  const { result: parentCategoryResult } =
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: Object.keys(categoryTree).map((name) => ({
          name,
          is_active: true,
        })),
      },
    });

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: Object.entries(categoryTree).flatMap(
        ([parentName, subcategoryNames]) => {
          const parent = parentCategoryResult.find(
            (cat) => cat.name === parentName
          )!;
          return subcategoryNames.map((name) => ({
            name,
            is_active: true,
            parent_category_id: parent.id,
          }));
        }
      ),
    },
  });

  // Placeholder values - review and adjust to match actual studio offerings.
  const { result: productOptionsResult } = await createProductOptionsWorkflow(
    container
  ).run({
    input: {
      product_options: [
        {
          title: "Size",
          values: ["Small", "Medium", "Large"],
        },
        {
          title: "Glaze",
          values: ["Matte White", "Speckled Clay"],
        },
      ],
    },
  });
  const sizeOption = productOptionsResult.find((o) => o.title === "Size")!;
  const glazeOption = productOptionsResult.find((o) => o.title === "Glaze")!;

  // Placeholder photography for the tea towel and pasta bowl - see the
  // seed-images comment in utils/seed-images.ts. The other products have no
  // images yet; add these once real photography is available.
  const teaTowelImageFiles = await uploadSeedImages(container, [
    "floral-kingdom-tea-towel-1.jpg",
    "floral-kingdom-tea-towel-2.jpg",
    "floral-kingdom-tea-towel-3.jpg",
  ]);
  const pastaBowlImageFiles = await uploadSeedImages(container, [
    "organic-pasta-bowl-1.jpg",
    "organic-pasta-bowl-2.jpg",
  ]);

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Stoneware Mug",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Mugs")!.id,
          ],
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
        {
          title: "Organic Pasta Bowl",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Bowls")!.id,
          ],
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
        {
          title: "Floral Kingdom Tea Towel",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Tea Towels")!.id,
          ],
          description:
            "Our tea towels are lightweight, quick-drying, and full of charm. With vibrant prints, they add colour to the kitchen and personality to even the most practical of chores. Whether draped over the oven handle or laid under warm challah, they bring colour to the everyday.",
          handle: "floral-kingdom-tea-towel",
          material: "Cotton",
          length: 46,
          width: 65,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          thumbnail: teaTowelImageFiles[0].url,
          images: teaTowelImageFiles.map((file) => ({ url: file.url })),
          options: [
            {
              title: "Color",
              values: ["White on Sage"],
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
  logger.info("Finished seeding product data.");
}
