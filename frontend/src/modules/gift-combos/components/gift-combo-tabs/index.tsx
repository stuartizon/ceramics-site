"use client"

import Ruler from "@modules/common/icons/ruler"
import Yarn from "@modules/common/icons/yarn"
import WashingMachine from "@modules/common/icons/washing-machine"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Accordion from "@modules/products/components/product-tabs/accordion"
import { ShippingInfoTab } from "@modules/products/components/product-tabs"
import { formatDimensions } from "@lib/util/format-dimensions"
import { CARE_CATEGORIES, getCareCategoryKey } from "@lib/util/care-instructions"
import { HttpTypes } from "@medusajs/types"

type GiftComboTabsProps = {
  products: HttpTypes.StoreProduct[]
}

const GiftComboTabs = ({ products }: GiftComboTabsProps) => {
  const dimensionEntries = products.flatMap((product) => {
    const dimensions = formatDimensions(product)
    return dimensions ? [{ name: product.title ?? "", dimensions }] : []
  })

  const materialEntries = products.flatMap((product) =>
    product.material
      ? [{ name: product.title ?? "", material: product.material }]
      : []
  )

  const careCategoryKeys = Array.from(
    new Set(
      products
        .map((product) => getCareCategoryKey(product))
        .filter((key): key is string => !!key)
    )
  )

  const tabs = [
    ...(dimensionEntries.length
      ? [
          {
            label: "Dimensions",
            icon: <Ruler size={20} />,
            component: <DimensionsTab entries={dimensionEntries} />,
          },
        ]
      : []),
    ...(materialEntries.length
      ? [
          {
            label: "Material",
            icon: <Yarn size={20} />,
            component: <MaterialTab entries={materialEntries} />,
          },
        ]
      : []),
    ...(careCategoryKeys.length
      ? [
          {
            label: "Care",
            icon: <WashingMachine size={20} />,
            component: <CareTab categoryKeys={careCategoryKeys} />,
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

const DimensionsTab = ({
  entries,
}: {
  entries: { name: string; dimensions: string }[]
}) => (
  <div className="text-small-regular py-2">
    <ul className="flex flex-col gap-y-1">
      {entries.map((entry) => (
        <li key={entry.name}>
          <span className="font-semibold">{entry.name}:</span>{" "}
          {entry.dimensions}
        </li>
      ))}
    </ul>
  </div>
)

const MaterialTab = ({
  entries,
}: {
  entries: { name: string; material: string }[]
}) => (
  <div className="text-small-regular py-2">
    <ul className="flex flex-col gap-y-1">
      {entries.map((entry) => (
        <li key={entry.name}>
          <span className="font-semibold">{entry.name}:</span>{" "}
          {entry.material}
        </li>
      ))}
    </ul>
  </div>
)

const CareTab = ({ categoryKeys }: { categoryKeys: string[] }) => (
  <div className="text-small-regular py-2">
    <div className="flex flex-col gap-y-4">
      {categoryKeys.map((key) => {
        const category = CARE_CATEGORIES[key]
        return (
          <div key={key}>
            <p className="font-semibold">{category.label}:</p>
            <p className="whitespace-pre-line">{category.instructions}</p>
          </div>
        )
      })}
    </div>
  </div>
)

export default GiftComboTabs
