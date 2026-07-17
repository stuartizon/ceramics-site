export const SUBCATEGORY_QUERY_KEY = "subcategory"

export const parseSubcategoryHandle = (
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): string | undefined => {
  if (typeof (searchParams as URLSearchParams).get === "function") {
    return (
      (searchParams as URLSearchParams).get(SUBCATEGORY_QUERY_KEY) ?? undefined
    )
  }

  const paramValue = (
    searchParams as Record<string, string | string[] | undefined>
  )[SUBCATEGORY_QUERY_KEY]

  return Array.isArray(paramValue) ? paramValue[0] : paramValue
}
