import { notFound } from "next/navigation"
import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import Link from "next/link"
import SubcategoryPills from "@modules/categories/components/subcategory-pills"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { getCategoryIds } from "@lib/data/categories"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  optionValueIds,
  activeSubcategory,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  optionValueIds?: OptionValueIds
  activeSubcategory?: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  const subcategories = category.category_children ?? []
  const selectedSubcategory = activeSubcategory
    ? subcategories.find((c) => c.handle === activeSubcategory)
    : undefined

  const categoryIds = getCategoryIds(selectedSubcategory ?? category)

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList
        sortBy={sort}
        data-testid="sort-by-container"
        hideOptionsPicker
      />
      <div className="w-full">
        <div className="flex flex-row mb-8 text-2xl-semi gap-4">
          {parents &&
            parents.map((parent) => (
              <span key={parent.id} className="text-ui-fg-subtle">
                <Link
                  className="mr-4 hover:text-navy"
                  href={`/categories/${parent.handle}`}
                  data-testid="sort-by-link"
                >
                  {parent.name}
                </Link>
                /
              </span>
            ))}
          <h1 data-testid="category-page-title">{category.name}</h1>
        </div>
        {category.description && (
          <div className="mb-8 text-base-regular">
            <p>{category.description}</p>
          </div>
        )}
        {subcategories.length > 0 && (
          <SubcategoryPills
            categories={subcategories}
            activeHandle={selectedSubcategory?.handle}
          />
        )}
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={categoryIds}
            optionValueIds={optionValueIds}
          />
        </Suspense>
      </div>
    </div>
  )
}
