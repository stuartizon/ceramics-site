"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const TEXTILE_CARE_INSTRUCTIONS = `Textile Care:
Machine wash cold on a gentle cycle with like colours. Use mild detergent without optical brighteners. Avoid tumble drying to preserve colour. Turn inside out when possible. Cool iron only if needed.`

const isTextileProduct = (product: HttpTypes.StoreProduct) =>
  product.categories?.some(
    (category) =>
      category.name === "Textiles" ||
      category.parent_category?.name === "Textiles"
  ) ?? false

const ProductTabs = ({ product }: ProductTabsProps) => {
  const productInfoFields = getProductInfoFields(product)

  const tabs = [
    ...(productInfoFields.length
      ? [
          {
            label: "Product Information",
            component: <ProductInfoTab fields={productInfoFields} />,
          },
        ]
      : []),
    ...(isTextileProduct(product)
      ? [
          {
            label: "Care Instructions",
            component: <CareInstructionsTab />,
          },
        ]
      : []),
    {
      label: "Shipping & Returns",
      component: <ShippingInfoTab />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const formatDimensions = (product: HttpTypes.StoreProduct) => {
  const parts = [
    product.length ? `${product.length}L` : null,
    product.width ? `${product.width}W` : null,
    product.height ? `${product.height}H` : null,
  ].filter(Boolean)

  return parts.length ? parts.join(" x ") : null
}

type ProductInfoField = { label: string; value: string }

const getProductInfoFields = (
  product: HttpTypes.StoreProduct
): ProductInfoField[] =>
  [
    { label: "Material", value: product.material },
    { label: "Country of origin", value: product.origin_country },
    { label: "Type", value: product.type?.value },
    { label: "Weight", value: product.weight ? `${product.weight} g` : null },
    { label: "Dimensions", value: formatDimensions(product) },
  ].filter((field): field is ProductInfoField => Boolean(field.value))

const ProductInfoTab = ({ fields }: { fields: ProductInfoField[] }) => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {fields.map((field) => (
          <div key={field.label}>
            <span className="font-semibold">{field.label}</span>
            <p>{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const CareInstructionsTab = () => {
  return (
    <div className="text-small-regular py-8">
      <p className="whitespace-pre-line">{TEXTILE_CARE_INSTRUCTIONS}</p>
    </div>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Fast delivery</span>
            <p className="max-w-sm">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Simple exchanges</span>
            <p className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Easy returns</span>
            <p className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
