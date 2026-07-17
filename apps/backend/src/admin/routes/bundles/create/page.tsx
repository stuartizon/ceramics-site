import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { sdk } from "../../../lib/sdk"
import { AdminBundle } from "../types"

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const CreateBundlePage = () => {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [handle, setHandle] = useState("")
  const [handleEdited, setHandleEdited] = useState(false)
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("draft")

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      sdk.client.fetch<{ bundle: AdminBundle }>("/admin/bundles", {
        method: "POST",
        body: {
          title,
          handle,
          description: description || null,
          thumbnail: thumbnail || null,
          status,
        },
      }),
    onSuccess: ({ bundle }) => {
      toast.success("Bundle created")
      navigate(`/bundles/${bundle.id}`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    },
  })

  return (
    <Container className="flex flex-col gap-y-6">
      <Heading level="h2">Create bundle</Heading>

      <div className="flex flex-col gap-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (!handleEdited) {
              setHandle(slugify(e.target.value))
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-y-2">
        <Label htmlFor="handle">Handle</Label>
        <Input
          id="handle"
          value={handle}
          onChange={(e) => {
            setHandle(e.target.value)
            setHandleEdited(true)
          }}
        />
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
        <Label htmlFor="thumbnail">Thumbnail URL</Label>
        <Input
          id="thumbnail"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
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

      <div className="flex justify-end gap-x-2">
        <Button
          variant="secondary"
          onClick={() => navigate("/bundles")}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={() => mutate()}
          disabled={!title || !handle || isPending}
          isLoading={isPending}
        >
          Create
        </Button>
      </div>
    </Container>
  )
}

export default CreateBundlePage
