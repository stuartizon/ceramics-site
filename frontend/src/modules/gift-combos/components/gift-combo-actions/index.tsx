"use client"

import { useState } from "react"
import { addBundleToCart } from "@lib/data/cart"
import { Button } from "@modules/common/components/ui"

type GiftComboActionsProps = {
  bundleId: string
  disabled?: boolean
}

export default function GiftComboActions({
  bundleId,
  disabled,
}: GiftComboActionsProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)

    await addBundleToCart({
      bundleId,
      quantity: 1,
    })

    setIsAdding(false)
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={!!disabled || isAdding}
      variant="primary"
      className="w-full h-10"
      isLoading={isAdding}
      data-testid="add-gift-combo-button"
    >
      Add gift combo to cart
    </Button>
  )
}
