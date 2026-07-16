import { readFileSync } from "fs";
import { join } from "path";
import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows";

// Dev/test fixture photos only - not the real production catalog images,
// which admins will upload themselves through the admin dashboard.
const SEED_IMAGES_DIR = join(__dirname, "seed-images");

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  png: "image/png",
};

async function uploadSeedImages(container: MedusaContainer, filenames: string[]) {
  const { result } = await uploadFilesWorkflow(container).run({
    input: {
      files: filenames.map((filename) => ({
        filename,
        mimeType: MIME_TYPES_BY_EXTENSION[filename.split(".").pop()!],
        content: readFileSync(join(SEED_IMAGES_DIR, filename)).toString(
          "base64"
        ),
        access: "public",
      })),
    },
  });
  return result;
}

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ["il"];

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Emma Ceramics Storefront",
          description: "Default sales channel for Emma Ceramics",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Emma Ceramics Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  const {
    result: [store],
  } = await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Emma Ceramics",
          supported_currencies: [
            {
              currency_code: "ils",
              is_default: true,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Israel",
          currency_code: "ils",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Jerusalem Studio",
          address: {
            city: "Jerusalem",
            country_code: "IL",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  // This is created by a migration script in core.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Jerusalem Studio Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Israel",
        geo_zones: [
          {
            country_code: "il",
            type: "country",
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  // Nominal placeholder shipping prices - adjust once real rates are known.
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 6,
          },
          {
            currency_code: "ils",
            amount: 20,
          },
          {
            region_id: region.id,
            amount: 20,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "usd",
            amount: 15,
          },
          {
            currency_code: "ils",
            amount: 50,
          },
          {
            region_id: region.id,
            amount: 50,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding product data...");

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
  // SEED_IMAGES_DIR comment above. The other products have no images yet;
  // add these once real photography is available.
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

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
