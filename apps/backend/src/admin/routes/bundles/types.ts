export type AdminBundleProduct = {
  id: string
  title?: string
  handle?: string
  thumbnail?: string | null
}

export type AdminBundle = {
  id: string
  handle: string
  title: string
  description: string | null
  thumbnail: string | null
  status: "draft" | "published"
  products: AdminBundleProduct[]
}
