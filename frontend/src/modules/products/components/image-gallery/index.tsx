"use client"

import { HttpTypes } from "@medusajs/types"
import { Container, clx } from "@modules/common/components/ui"
import Image from "next/image"
import { useEffect, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const galleryKey = images.map((image) => image.id).join(",")

  useEffect(() => {
    setSelectedIndex(0)
  }, [galleryKey])

  if (!images.length) {
    return null
  }

  const selectedImage = images[selectedIndex] ?? images[0]

  return (
    <div className="flex flex-col w-full min-w-0 gap-y-4">
      {/* Mobile: swipeable carousel */}
      <div className="small:hidden -mx-6 flex snap-x snap-mandatory gap-x-4 overflow-x-auto px-6 no-scrollbar">
        {images.map((image, index) => (
          <Container
            key={image.id}
            className="relative aspect-square w-[85vw] flex-shrink-0 snap-center overflow-hidden bg-ui-bg-subtle"
          >
            {!!image.url && (
              <Image
                src={image.url}
                priority={index === 0}
                className="absolute inset-0 rounded-rounded"
                alt={`Product image ${index + 1}`}
                fill
                sizes="90vw"
                style={{
                  objectFit: "cover",
                }}
              />
            )}
          </Container>
        ))}
      </div>

      {/* Desktop: main image with thumbnail strip */}
      <div className="hidden small:flex small:flex-col gap-y-4">
        <Container
          className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle"
          id={selectedImage.id}
        >
          {!!selectedImage.url && (
            <Image
              src={selectedImage.url}
              priority
              className="absolute inset-0 rounded-rounded"
              alt={`Product image ${selectedIndex + 1}`}
              fill
              sizes="(max-width: 992px) 480px, 800px"
              style={{
                objectFit: "cover",
              }}
            />
          )}
        </Container>

        {images.length > 1 && (
          <div className="flex flex-wrap gap-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === selectedIndex}
                className={clx(
                  "relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-rounded bg-ui-bg-subtle transition-opacity",
                  {
                    "ring-2 ring-ui-fg-base": index === selectedIndex,
                    "opacity-60 hover:opacity-100": index !== selectedIndex,
                  }
                )}
              >
                {!!image.url && (
                  <Image
                    src={image.url}
                    className="absolute inset-0"
                    alt=""
                    fill
                    sizes="80px"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageGallery
