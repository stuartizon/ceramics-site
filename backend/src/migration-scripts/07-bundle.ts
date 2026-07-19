import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import { BUNDLE_MODULE } from "../modules/bundle";
import { uploadSeedImages } from "./utils/seed-images";

export default async function bundle({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const bundleModuleService = container.resolve(BUNDLE_MODULE);

  logger.info("Seeding bundles.");

  const bowlAndTowelDuoImageFiles = await uploadSeedImages(container, [
    "bowl-and-towel-duo-1.jpg",
    "bowl-and-towel-duo-2.jpg",
    "bowl-and-towel-duo-3.jpg",
    "bowl-and-towel-duo-4.jpg",
  ]);

  const { data: bundleProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.id"],
    filters: { handle: ["organic-pasta-bowl", "floral-kingdom-tea-towel"] },
  });

  const bundle = await bundleModuleService.createBundles({
    handle: "bowl-and-towel-duo",
    title: "Bowl & Towel Duo",
    description:
      "An organic pasta bowl paired with a Floral Kingdom tea towel.",
    thumbnail: bowlAndTowelDuoImageFiles[0].url,
    status: "published",
  });

  for (const [index, file] of bowlAndTowelDuoImageFiles.entries()) {
    await bundleModuleService.createBundleImages({
      url: file.url,
      rank: index,
      bundle_id: bundle.id,
    });
  }

  for (const product of bundleProducts) {
    await link.create({
      [BUNDLE_MODULE]: { bundle_id: bundle.id },
      [Modules.PRODUCT]: { product_id: product.id },
    });
  }

  await bundleModuleService.createBundleThemes({
    bundle_id: bundle.id,
    name: "Default",
    rank: 0,
    items: bundleProducts
      .filter((product) => product.variants?.length)
      .map((product) => ({
        product_id: product.id,
        variant_id: product.variants![0].id,
      })) as unknown as Record<string, unknown>,
  });

  logger.info("Finished seeding bundles.");
}
