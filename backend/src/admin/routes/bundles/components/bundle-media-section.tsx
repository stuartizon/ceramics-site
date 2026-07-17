import { Photo, ThumbnailBadge, Trash } from "@medusajs/icons"
import { IconButton, Text, Tooltip, clx, toast } from "@medusajs/ui"
import { useRef, useState } from "react"
import { sdk } from "../../../lib/sdk"

export type BundleMediaImage = { id?: string; url: string }

type BundleMediaSectionProps = {
  images: BundleMediaImage[]
  thumbnail: string | null
  onChange: (images: BundleMediaImage[], thumbnail: string | null) => void
}

export default function BundleMediaSection({
  images,
  thumbnail,
  onChange,
}: BundleMediaSectionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = async (files: FileList) => {
    if (!files.length) {
      return
    }

    setIsUploading(true)
    try {
      const { files: uploaded } = await sdk.admin.upload.create({
        files: Array.from(files),
      })
      const newImages = uploaded.map((file) => ({ url: file.url }))
      const nextImages = [...images, ...newImages]
      const nextThumbnail = thumbnail ?? newImages[0]?.url ?? null
      onChange(nextImages, nextThumbnail)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload images")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = (url: string) => {
    const nextImages = images.filter((image) => image.url !== url)
    const nextThumbnail =
      thumbnail === url ? nextImages[0]?.url ?? null : thumbnail
    onChange(nextImages, nextThumbnail)
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="grid grid-cols-3 gap-3 small:grid-cols-4">
        {images.map((image) => {
          const isThumbnail = image.url === thumbnail

          return (
            <div
              key={image.id ?? image.url}
              className="group border-ui-border-base bg-ui-bg-subtle relative aspect-square overflow-hidden rounded-md border"
            >
              <img
                src={image.url}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                className={clx(
                  "absolute left-1.5 top-1.5 transition-opacity",
                  isThumbnail
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-60 hover:!opacity-100"
                )}
                onClick={() => onChange(images, image.url)}
              >
                <Tooltip content={isThumbnail ? "Thumbnail" : "Make thumbnail"}>
                  <ThumbnailBadge />
                </Tooltip>
              </button>
              <IconButton
                type="button"
                size="small"
                variant="transparent"
                className="bg-ui-bg-base/80 absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemove(image.url)}
              >
                <Trash />
              </IconButton>
            </div>
          )
        })}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDraggingOver(true)
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDraggingOver(false)
            if (e.dataTransfer.files?.length) {
              uploadFiles(e.dataTransfer.files)
            }
          }}
          disabled={isUploading}
          className={clx(
            "border-ui-border-base text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover flex aspect-square flex-col items-center justify-center gap-y-1 rounded-md border border-dashed",
            { "bg-ui-bg-subtle-hover": isDraggingOver }
          )}
        >
          <Photo />
          <Text size="xsmall">{isUploading ? "Uploading..." : "Upload"}</Text>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) {
            uploadFiles(e.target.files)
          }
          e.target.value = ""
        }}
      />
    </div>
  )
}
