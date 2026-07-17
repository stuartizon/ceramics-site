import Image from "next/image"

import { listCategories } from "@lib/data/categories"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

export default async function CategoryGrid() {
  const categories = await listCategories()

  const topLevelCategories = categories?.filter((c) => !c.parent_category) ?? []

  if (topLevelCategories.length === 0) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-16">
      <ul className="grid grid-cols-2 xsmall:grid-cols-3 small:grid-cols-5 gap-x-6 gap-y-8">
        {topLevelCategories.map((category) => {
          const metadataImage = category.metadata?.image
          const image =
            (typeof metadataImage === "string" && metadataImage) ||
            category.products?.[0]?.thumbnail ||
            undefined

          return (
            <li key={category.id}>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                className="group block overflow-hidden rounded-large shadow-elevation-card-rest transition-shadow duration-150 hover:shadow-elevation-card-hover"
                data-testid="category-grid-link"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle">
                  {image ? (
                    <Image
                      src={image}
                      alt={category.name}
                      fill
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <PlaceholderImage size={24} />
                    </div>
                  )}
                </div>
                <div className="bg-lavender py-4 text-center">
                  <Text className="uppercase tracking-wide text-navy txt-compact-medium-plus">
                    {category.name}
                  </Text>
                </div>
              </LocalizedClientLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
