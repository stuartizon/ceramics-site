import { MedusaContainer } from "@medusajs/framework";
import { updateProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";

const images: Record<string, string> = {
  ceramics: "/images/categories/ceramics.jpg",
  textiles: "/images/categories/textiles.jpg",
  "home-decor": "/images/categories/home-decor.jpg",
  accessories: "/images/categories/accessories.jpg",
  "artisanal-eats": "/images/categories/artisanal-eats.jpg",
};

export default async function setCategoryImages({
  container,
}: {
  container: MedusaContainer;
}) {
  for (const [handle, image] of Object.entries(images)) {
    await updateProductCategoriesWorkflow(container).run({
      input: {
        selector: { handle },
        update: { metadata: { image } },
      },
    });
  }
}
