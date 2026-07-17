import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { StoreBundle } from "@lib/data/bundles"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { Heading, Text } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductPreview from "@modules/products/components/product-preview"
import GiftComboActions from "@modules/gift-combos/components/gift-combo-actions"

type GiftComboDetailTemplateProps = {
  bundle: StoreBundle
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function GiftComboDetailTemplate({
  bundle,
  products,
  region,
}: GiftComboDetailTemplateProps) {
  if (!bundle) {
    return notFound()
  }

  const productPrices = products
    .map((product) => getProductPrice({ product }).cheapestPrice)
    .filter((price): price is NonNullable<typeof price> => !!price)

  const combinedTotal =
    productPrices.length === products.length && productPrices.length > 0
      ? convertToLocale({
          amount: productPrices.reduce(
            (sum, price) => sum + price.calculated_price_number,
            0
          ),
          currency_code: productPrices[0].currency_code,
        })
      : null

  return (
    <div
      className="content-container flex flex-col small:flex-row small:items-start py-6 relative gap-x-12"
      data-testid="gift-combo-container"
    >
      <div className="block w-full small:max-w-[500px] relative">
        {bundle.images.length > 0 ? (
          <ImageGallery
            images={[...bundle.images].sort((a, b) => a.rank - b.rank)}
          />
        ) : (
          <Thumbnail thumbnail={bundle.thumbnail} images={null} size="full" />
        )}
      </div>

      <div className="flex flex-col small:sticky small:top-48 small:py-0 w-full py-8 gap-y-6">
        <div className="flex flex-col gap-y-4">
          <Heading level="h2" className="text-3xl leading-10 text-ui-fg-base">
            {bundle.title}
          </Heading>
          {bundle.description && (
            <Text className="text-medium text-ui-fg-subtle whitespace-pre-line">
              {bundle.description}
            </Text>
          )}
        </div>

        <div className="flex flex-col gap-y-4">
          <Text className="text-ui-fg-subtle">Included in this combo</Text>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-8">
            {products.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>
        </div>

        {combinedTotal && (
          <Text className="text-xl-semi text-ui-fg-base">
            {combinedTotal}
          </Text>
        )}

        <GiftComboActions bundleId={bundle.id} disabled={products.length === 0} />
      </div>
    </div>
  )
}
