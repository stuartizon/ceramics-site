import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import Link from "next/link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import PreviewPrice from "@modules/products/components/product-preview/price"

type BundleProductRowProps = {
  product: HttpTypes.StoreProduct
}

export default function BundleProductRow({ product }: BundleProductRowProps) {
  const { cheapestPrice } = getProductPrice({ product })
  const image = product.thumbnail || product.images?.[0]?.url

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex items-center gap-x-3"
      data-testid="bundle-product-wrapper"
    >
      <div className="relative aspect-square w-14 flex-shrink-0 overflow-hidden rounded-rounded bg-ui-bg-subtle">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="56px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlaceholderImage size={16} />
          </div>
        )}
      </div>
      <div className="flex flex-1 items-center justify-between gap-x-2 txt-compact-medium min-w-0">
        <Text className="text-ui-fg-subtle truncate" data-testid="product-title">
          {product.title}
        </Text>
        <div className="flex items-center gap-x-2 flex-shrink-0">
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
        </div>
      </div>
    </Link>
  )
}
