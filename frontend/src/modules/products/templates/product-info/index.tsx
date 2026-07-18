import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import Link from "next/link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  // Rendered twice (once for the mobile stacking order, once for the
  // desktop column) so the layout can place the image between this and
  // the rest of the info on mobile without duplicating ids/test-ids.
  primary?: boolean
}

const ProductInfo = ({ product, primary = true }: ProductInfoProps) => {
  return (
    <div id={primary ? "product-info" : undefined}>
      <div className="flex flex-col gap-y-4 max-w-[500px]">
        {product.collection && (
          <Link
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            {product.collection.title}
          </Link>
        )}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid={primary ? "product-title" : undefined}
        >
          {product.title}
        </Heading>

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid={primary ? "product-description" : undefined}
        >
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
