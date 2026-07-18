import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { StoreBundle } from "@lib/data/bundles"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { Heading, Text } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import ImageGallery from "@modules/products/components/image-gallery"
import GiftComboActions from "@modules/gift-combos/components/gift-combo-actions"
import GiftComboTabs from "@modules/gift-combos/components/gift-combo-tabs"
import BundleProductRow from "@modules/gift-combos/components/bundle-product-row"

type GiftComboDetailTemplateProps = {
  bundle: StoreBundle
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function GiftComboDetailTemplate({
  bundle,
  products,
  region: _region,
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

  const images = [...bundle.images].sort((a, b) => a.rank - b.rank)

  const priceDisplay = combinedTotal && (
    <div className="flex flex-col text-ui-fg-base">
      <span className="text-xl-semi">{combinedTotal}</span>
    </div>
  )

  return (
    <div
      className="content-container flex flex-col small:flex-row small:gap-x-16 medium:gap-x-24 gap-y-10 px-6 small:px-24 medium:px-36 large:px-48 py-6 relative"
      data-testid="gift-combo-container"
    >
      {/* Mobile only: name/description above the images */}
      <div className="w-full small:hidden flex flex-col gap-y-4">
        <Heading level="h2" className="text-3xl leading-10 text-ui-fg-base">
          {bundle.title}
        </Heading>
        {priceDisplay}
        {bundle.description && (
          <Text className="text-medium text-ui-fg-subtle whitespace-pre-line">
            {bundle.description}
          </Text>
        )}
      </div>

      <div className="w-full min-w-0 relative small:basis-0 small:grow-[3] small:shrink-0">
        <div className="small:sticky small:top-16">
          {images.length > 0 ? (
            <ImageGallery images={images} />
          ) : (
            <Thumbnail thumbnail={bundle.thumbnail} images={null} size="full" />
          )}
        </div>
      </div>

      {/* Desktop only: name/description, included products, actions and info tabs stacked in their own column */}
      <div className="flex flex-col gap-y-10 w-full min-w-0 small:basis-0 small:grow-[2] small:shrink-0 small:self-start">
        <div className="hidden small:flex flex-col gap-y-4 max-w-[500px]">
          <Heading level="h2" className="text-3xl leading-10 text-ui-fg-base">
            {bundle.title}
          </Heading>
          {priceDisplay}
          {bundle.description && (
            <Text className="text-medium text-ui-fg-subtle whitespace-pre-line">
              {bundle.description}
            </Text>
          )}
        </div>

        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-3">
            <Text className="text-ui-fg-subtle">Included in this combo:</Text>
            <ul className="flex flex-col gap-y-3">
              {products.map((product) => (
                <li key={product.id}>
                  <BundleProductRow product={product} />
                </li>
              ))}
            </ul>
          </div>

          <GiftComboActions
            bundleId={bundle.id}
            disabled={products.length === 0}
          />
        </div>

        <GiftComboTabs products={products} />
      </div>
    </div>
  )
}
