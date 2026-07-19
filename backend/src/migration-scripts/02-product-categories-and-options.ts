import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createProductCategoriesWorkflow,
  createProductOptionsWorkflow,
} from "@medusajs/medusa/core-flows";

export default async function productCategoriesAndOptions({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  logger.info("Seeding product categories and options...");

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

  await createProductCategoriesWorkflow(container).run({
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
  await createProductOptionsWorkflow(container).run({
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

  logger.info("Finished seeding product categories and options.");
}
