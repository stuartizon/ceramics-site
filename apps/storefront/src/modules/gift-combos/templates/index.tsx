import { listBundles } from "@lib/data/bundles"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

export default async function GiftCombosTemplate() {
  const bundles = await listBundles()

  return (
    <div className="content-container py-6">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-base-regular text-gray-600 mb-6">
          Gift Combos
        </span>
        <p className="text-2xl-regular text-ui-fg-base max-w-lg">
          Thoughtfully paired products, ready to give.
        </p>
      </div>

      {bundles.length === 0 ? (
        <Text className="text-ui-fg-subtle text-center">
          No gift combos available right now.
        </Text>
      ) : (
        <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
          {bundles.map((bundle) => (
            <li key={bundle.id}>
              <LocalizedClientLink
                href={`/gift-combos/${bundle.handle}`}
                className="group"
              >
                <Thumbnail
                  thumbnail={bundle.thumbnail}
                  images={null}
                  size="square"
                />
                <div className="flex txt-compact-medium mt-4 justify-between">
                  <Text
                    className="text-ui-fg-subtle"
                    data-testid="gift-combo-title"
                  >
                    {bundle.title}
                  </Text>
                </div>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
