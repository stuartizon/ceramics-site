"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type SelectedVariantContextValue = {
  selectedVariantId?: string
  setSelectedVariantId: (id?: string) => void
}

const SelectedVariantContext =
  createContext<SelectedVariantContextValue | null>(null)

export const SelectedVariantProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >()

  return (
    <SelectedVariantContext.Provider
      value={{ selectedVariantId, setSelectedVariantId }}
    >
      {children}
    </SelectedVariantContext.Provider>
  )
}

export const useSelectedVariantId = () => {
  const context = useContext(SelectedVariantContext)
  if (!context) {
    throw new Error(
      "useSelectedVariantId must be used within a SelectedVariantProvider"
    )
  }
  return context
}
