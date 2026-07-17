import { Plus, Trash } from "@medusajs/icons"
import {
  Button,
  Checkbox,
  Container,
  Drawer,
  Heading,
  IconButton,
  Input,
  Label,
  Prompt,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { sdk } from "../../../lib/sdk"
import { AdminBundle } from "../types"
import BundleMediaSection, {
  BundleMediaImage,
} from "../components/bundle-media-section"

const BundleDetailPage = () => {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ["bundle", id],
    queryFn: () =>
      sdk.client.fetch<{ bundle: AdminBundle }>(`/admin/bundles/${id}`),
    enabled: !!id,
  })

  if (isLoading || !data?.bundle) {
    return (
      <Container>
        <Text className="text-ui-fg-subtle">Loading...</Text>
      </Container>
    )
  }

  return <BundleDetailContent key={data.bundle.id} bundle={data.bundle} />
}

const BundleDetailContent = ({ bundle }: { bundle: AdminBundle }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [title, setTitle] = useState(bundle.title)
  const [handle, setHandle] = useState(bundle.handle)
  const [description, setDescription] = useState(bundle.description ?? "")
  const [images, setImages] = useState<BundleMediaImage[]>(bundle.images)
  const [thumbnail, setThumbnail] = useState(bundle.thumbnail)
  const [status, setStatus] = useState(bundle.status)
  const [deletePromptOpen, setDeletePromptOpen] = useState(false)
  const [addProductsOpen, setAddProductsOpen] = useState(false)

  const invalidateBundle = () =>
    queryClient.invalidateQueries({ queryKey: ["bundle", bundle.id] })

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ bundle: AdminBundle }>(`/admin/bundles/${bundle.id}`, {
        method: "POST",
        body: {
          title,
          handle,
          description: description || null,
          thumbnail,
          status,
          images,
        },
      }),
    onSuccess: () => {
      toast.success("Bundle saved")
      queryClient.invalidateQueries({ queryKey: ["bundles"] })
      invalidateBundle()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    },
  })

  const { mutate: deleteBundle, isPending: isDeleting } = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/bundles/${bundle.id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Bundle deleted")
      queryClient.invalidateQueries({ queryKey: ["bundles"] })
      navigate("/bundles")
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    },
  })

  const { mutate: removeProduct } = useMutation({
    mutationFn: (productId: string) =>
      sdk.client.fetch(`/admin/bundles/${bundle.id}/products`, {
        method: "POST",
        body: { remove: [productId] },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bundles"] })
      invalidateBundle()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    },
  })

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          <Heading level="h2">{bundle.title}</Heading>
          <IconButton
            variant="transparent"
            onClick={() => setDeletePromptOpen(true)}
            data-testid="delete-bundle-button"
          >
            <Trash />
          </IconButton>
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="handle">Handle</Label>
          <Input id="handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label>Media</Label>
          <BundleMediaSection
            images={images}
            thumbnail={thumbnail}
            onChange={(nextImages, nextThumbnail) => {
              setImages(nextImages)
              setThumbnail(nextThumbnail)
            }}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as "draft" | "published")}
          >
            <Select.Trigger id="status">
              <Select.Value placeholder="Select status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="draft">Draft</Select.Item>
              <Select.Item value="published">Published</Select.Item>
            </Select.Content>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => save()}
            disabled={!title || !handle || isSaving}
            isLoading={isSaving}
          >
            Save
          </Button>
        </div>
      </Container>

      <Container className="flex flex-col gap-y-4">
        <div className="flex items-center justify-between">
          <Heading level="h2">Products</Heading>
          <Button
            size="small"
            variant="secondary"
            onClick={() => setAddProductsOpen(true)}
            data-testid="add-products-button"
          >
            <Plus /> Add products
          </Button>
        </div>

        {bundle.products.length === 0 ? (
          <Text className="text-ui-fg-subtle">No products in this bundle yet.</Text>
        ) : (
          <ul className="flex flex-col gap-y-2">
            {bundle.products.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between border-ui-border-base rounded-md border px-4 py-2"
              >
                <div className="flex items-center gap-x-3">
                  {product.thumbnail && (
                    <img
                      src={product.thumbnail}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  <div className="flex flex-col">
                    <Text size="small" weight="plus">
                      {product.title}
                    </Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      {product.handle}
                    </Text>
                  </div>
                </div>
                <IconButton
                  variant="transparent"
                  onClick={() => removeProduct(product.id)}
                  data-testid="remove-product-button"
                >
                  <Trash />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </Container>

      <Prompt open={deletePromptOpen} onOpenChange={setDeletePromptOpen}>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete bundle</Prompt.Title>
            <Prompt.Description>
              Are you sure you want to delete "{bundle.title}"? This cannot be
              undone.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel>Cancel</Prompt.Cancel>
            <Prompt.Action
              onClick={() => deleteBundle()}
              disabled={isDeleting}
              data-testid="confirm-delete-bundle-button"
            >
              Delete
            </Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>

      <AddProductsDrawer
        bundleId={bundle.id}
        existingProductIds={bundle.products.map((product) => product.id)}
        open={addProductsOpen}
        onOpenChange={setAddProductsOpen}
        onAdded={() => {
          queryClient.invalidateQueries({ queryKey: ["bundles"] })
          invalidateBundle()
        }}
      />
    </div>
  )
}

const AddProductsDrawer = ({
  bundleId,
  existingProductIds,
  open,
  onOpenChange,
  onAdded,
}: {
  bundleId: string
  existingProductIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: () => void
}) => {
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () =>
      sdk.admin.product.list({ q: search || undefined, limit: 20 }),
    enabled: open,
  })

  const availableProducts = (data?.products ?? []).filter(
    (product) => !existingProductIds.includes(product.id)
  )

  const { mutate: addProducts, isPending } = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/bundles/${bundleId}/products`, {
        method: "POST",
        body: { add: selectedIds },
      }),
    onSuccess: () => {
      toast.success("Products added")
      setSelectedIds([])
      setSearch("")
      onOpenChange(false)
      onAdded()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    },
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Add products</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {!isLoading && availableProducts.length === 0 && (
            <Text className="text-ui-fg-subtle">No matching products.</Text>
          )}
          <ul className="flex flex-col gap-y-2">
            {availableProducts.map((product) => (
              <li key={product.id} className="flex items-center gap-x-3">
                <Checkbox
                  id={product.id}
                  checked={selectedIds.includes(product.id)}
                  onCheckedChange={(checked) =>
                    setSelectedIds((prev) =>
                      checked
                        ? [...prev, product.id]
                        : prev.filter((id) => id !== product.id)
                    )
                  }
                />
                <Label htmlFor={product.id} className="cursor-pointer">
                  {product.title}
                </Label>
              </li>
            ))}
          </ul>
        </Drawer.Body>
        <Drawer.Footer>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => addProducts()}
            disabled={selectedIds.length === 0 || isPending}
            isLoading={isPending}
            data-testid="confirm-add-products-button"
          >
            Add {selectedIds.length > 0 ? selectedIds.length : ""}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default BundleDetailPage
