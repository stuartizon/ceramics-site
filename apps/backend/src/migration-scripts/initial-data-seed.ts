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
} from "@medusajs/medusa/core-flows";

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

  // No product images yet - add these once real product photography is available.
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
          title: "Ceramic Bowl",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Bowls")!.id,
          ],
          description:
            "A handmade ceramic bowl, thrown and glazed in the studio. Each piece is unique.",
          handle: "ceramic-bowl",
          weight: 500,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          options: [{ id: sizeOption.id }],
          variants: [
            {
              title: "Small",
              sku: "BOWL-S",
              options: {
                Size: "Small",
              },
              prices: [
                {
                  amount: 150,
                  currency_code: "ils",
                },
                {
                  amount: 45,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Medium",
              sku: "BOWL-M",
              options: {
                Size: "Medium",
              },
              prices: [
                {
                  amount: 150,
                  currency_code: "ils",
                },
                {
                  amount: 45,
                  currency_code: "usd",
                },
              ],
            },
            {
              title: "Large",
              sku: "BOWL-L",
              options: {
                Size: "Large",
              },
              prices: [
                {
                  amount: 150,
                  currency_code: "ils",
                },
                {
                  amount: 45,
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
