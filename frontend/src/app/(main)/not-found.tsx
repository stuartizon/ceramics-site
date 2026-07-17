import { Metadata } from "next"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)] text-center">
      <h1 className="text-2xl-semi text-ui-fg-base">Oops, we dropped that one</h1>
      <div className="relative aspect-[4/3] w-full max-w-md">
        <Image
          src="/images/errors/broken-plate.jpg"
          alt="A shattered ceramic plate lying in pieces on a wooden floor"
          fill
          className="object-cover object-center"
          sizes="448px"
          priority
        />
      </div>
      <p className="text-small-regular text-ui-fg-base max-w-xs">
        We couldn't find the page you were looking for.
      </p>
      <LocalizedClientLink
        href="/"
        className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
      >
        Home
      </LocalizedClientLink>
    </div>
  )
}
