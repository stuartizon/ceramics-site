"use client"

import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import Ruler from "@modules/common/icons/ruler"
import WashingMachine from "@modules/common/icons/washing-machine"
import Yarn from "@modules/common/icons/yarn"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"
import { getCareInstructions } from "@lib/util/care-instructions"
import { formatDimensions } from "@lib/util/format-dimensions"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const dimensions = formatDimensions(product)
  const careInstructions = getCareInstructions(product)

  const tabs = [
    ...(dimensions
      ? [
          {
            label: "Dimensions",
            icon: <Ruler size={20} />,
            component: <DimensionsTab dimensions={dimensions} />,
          },
        ]
      : []),
    ...(product.material
      ? [
          {
            label: "Material",
            icon: <Yarn size={20} />,
            component: <MaterialTab material={product.material} />,
          },
        ]
      : []),
    ...(careInstructions
      ? [
          {
            label: "Care",
            icon: <WashingMachine size={20} />,
            component: <CareInstructionsTab instructions={careInstructions} />,
          },
        ]
      : []),
    {
      label: "Shipping",
      icon: <FastDelivery size={20} />,
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
            icon={tab.icon}
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

const DimensionsTab = ({ dimensions }: { dimensions: string }) => {
  return (
    <div className="text-small-regular py-2">
      <p>{dimensions}</p>
    </div>
  )
}

const MaterialTab = ({ material }: { material: string }) => {
  return (
    <div className="text-small-regular py-2">
      <p>{material}</p>
    </div>
  )
}

const CareInstructionsTab = ({ instructions }: { instructions: string }) => {
  return (
    <div className="text-small-regular py-2">
      <p className="whitespace-pre-line">{instructions}</p>
    </div>
  )
}

export const ShippingInfoTab = () => {
  return (
    <div className="text-small-regular py-2">
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
