"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import clsx from "clsx"

import { HttpTypes } from "@medusajs/types"
import { SUBCATEGORY_QUERY_KEY } from "@lib/util/category-filters"

type SubcategoryPillsProps = {
  categories: HttpTypes.StoreProductCategory[]
  activeHandle?: string
}

const pillClasses = (isSelected: boolean) =>
  clsx(
    "border-ui-border-base border text-small-regular h-10 rounded-full px-4 flex items-center transition-colors duration-150",
    {
      "border-ui-border-interactive text-ui-fg-base": isSelected,
      "text-ui-fg-muted hover:text-ui-fg-base": !isSelected,
    }
  )

const SubcategoryPills = ({
  categories,
  activeHandle,
}: SubcategoryPillsProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setSubcategory = (handle?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")

    if (handle) {
      params.set(SUBCATEGORY_QUERY_KEY, handle)
    } else {
      params.delete(SUBCATEGORY_QUERY_KEY)
    }

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8" data-testid="subcategory-pills">
      <button
        onClick={() => setSubcategory(undefined)}
        className={pillClasses(!activeHandle)}
        aria-pressed={!activeHandle}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => setSubcategory(c.handle)}
          className={pillClasses(activeHandle === c.handle)}
          aria-pressed={activeHandle === c.handle}
        >
          {c.name}
        </button>
      ))}
    </div>
  )
}

export default SubcategoryPills
