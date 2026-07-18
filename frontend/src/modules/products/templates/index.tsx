import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { SelectedVariantProvider } from "@modules/products/context/selected-variant-context"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <SelectedVariantProvider>
        <div
          className="content-container flex flex-col small:flex-row small:gap-x-16 medium:gap-x-24 gap-y-10 px-6 small:px-24 medium:px-36 large:px-48 py-6 relative"
          data-testid="product-container"
        >
          {/* Mobile only: name/description above the images */}
          <div className="w-full small:hidden">
            <ProductInfo product={product} primary={false} />
          </div>

          <div className="w-full min-w-0 relative small:basis-0 small:grow-[3] small:shrink-0">
            <div className="small:sticky small:top-16">
              <ImageGallery images={images} />
            </div>
          </div>

          {/* Desktop only: name/description, actions and info tabs stacked in their own column, independent of the image's height */}
          <div className="flex flex-col gap-y-10 w-full min-w-0 small:basis-0 small:grow-[2] small:shrink-0 small:self-start">
            <div className="hidden small:block">
              <ProductInfo product={product} />
            </div>

            <div className="flex flex-col gap-y-6">
              <ProductOnboardingCta />
              <Suspense
                fallback={
                  <ProductActions
                    disabled={true}
                    product={product}
                    region={region}
                  />
                }
              >
                <ProductActionsWrapper id={product.id} region={region} />
              </Suspense>
            </div>

            <ProductTabs product={product} />
          </div>
        </div>
      </SelectedVariantProvider>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
