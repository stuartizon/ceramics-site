"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { listProducts } from "./products"

export type StoreBundle = {
  id: string
  handle: string
  title: string
  description: string | null
  thumbnail: string | null
  status: string
  products: { id: string; handle: string }[]
}

export const listBundles = async (): Promise<StoreBundle[]> => {
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("bundles")),
  }

  return sdk.client
    .fetch<{ bundles: StoreBundle[] }>("/store/bundles", {
      method: "GET",
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ bundles }) => bundles)
}

export const getBundleByHandle = async (
  handle: string
): Promise<StoreBundle | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("bundles")),
  }

  return sdk.client
    .fetch<{ bundle: StoreBundle }>(`/store/bundles/${handle}`, {
      method: "GET",
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ bundle }) => bundle)
    .catch(() => null)
}

export const getBundleProducts = async ({
  bundle,
  regionId,
}: {
  bundle: StoreBundle
  regionId: string
}): Promise<HttpTypes.StoreProduct[]> => {
  if (!bundle.products.length) {
    return []
  }

  const { response } = await listProducts({
    queryParams: { handle: bundle.products.map((product) => product.handle) },
    regionId,
  })

  return response.products
}
