import { Metadata } from "next"

import GiftCombosTemplate from "@modules/gift-combos/templates"

export const metadata: Metadata = {
  title: "Gift Combos",
  description:
    "Thoughtfully paired products from Emma Ceramics, ready to give.",
}

export default function GiftCombosPage() {
  return <GiftCombosTemplate />
}
