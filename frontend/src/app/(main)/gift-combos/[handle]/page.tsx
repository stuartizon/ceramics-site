import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getBundleByHandle, getBundleProducts } from "@lib/data/bundles"
import { getRegion } from "@lib/data/regions"
import GiftComboDetailTemplate from "@modules/gift-combos/templates/gift-combo-detail"

type Props = {
  params: Promise<{ handle: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { handle } = await props.params
  const bundle = await getBundleByHandle(handle)

  if (!bundle) {
    notFound()
  }

  return {
    title: `${bundle.title} | Emma Ceramics`,
    description: bundle.description ?? bundle.title,
    openGraph: {
      title: `${bundle.title} | Emma Ceramics`,
      description: bundle.description ?? bundle.title,
      images: bundle.thumbnail ? [bundle.thumbnail] : [],
    },
  }
}

export default async function GiftComboPage(props: Props) {
  const { handle } = await props.params
  const region = await getRegion()

  if (!region) {
    notFound()
  }

  const bundle = await getBundleByHandle(handle)

  if (!bundle) {
    notFound()
  }

  const products = await getBundleProducts({ bundle, regionId: region.id })

  return (
    <GiftComboDetailTemplate bundle={bundle} products={products} region={region} />
  )
}
