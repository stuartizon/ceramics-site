import Image from "next/image"

import Link from "next/link"
import { Button, Heading, Text } from "@modules/common/components/ui"

const OurStoryTemplate = () => {
  return (
    <>
      <div className="w-full border-b border-ui-border-base bg-gradient-to-b from-lavender to-white">
        <div className="content-container flex flex-col items-center gap-6 py-20 text-center small:py-28">
          <Text className="uppercase tracking-widest text-mauve-dark txt-compact-medium-plus">
            Our Story
          </Text>
          <Heading
            level="h1"
            className="max-w-3xl text-3xl font-normal leading-tight small:text-4xl small:leading-tight"
          >
            We believe beautiful, handmade things can make any space feel like
            home.
          </Heading>
        </div>
      </div>

      <div className="content-container py-16 small:py-24">
        <div className="grid grid-cols-1 items-center gap-10 small:grid-cols-2 small:gap-16">
          <div className="relative order-2 aspect-[4/5] w-full overflow-hidden rounded-large shadow-elevation-card-rest small:order-1">
            <Image
              src="/images/about/our-story-1.png"
              alt="An artisan hand-shaping a piece of ceramic on a workbench"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 flex flex-col gap-4 small:order-2">
            <Heading level="h2">It started with a love of beautiful things</Heading>
            <Text className="text-ui-fg-subtle">
              Emma Ceramics began with a simple belief: the objects we live
              with every day should be made with care, not just manufactured.
              We fell for the warmth of hand-thrown pottery, the small
              imperfections that prove a human hand was involved, and the way
              a well-made piece can turn an ordinary morning into something a
              little more special.
            </Text>
            <Text className="text-ui-fg-subtle">
              What began as a personal search for pieces with soul quickly
              grew into a mission: to work directly with skilled artisans and
              bring their craft into homes that value it as much as we do.
            </Text>
          </div>
        </div>
      </div>

      <div className="border-y border-ui-border-base bg-lavender">
        <div className="content-container mx-auto max-w-3xl py-16 text-center small:py-20">
          <Text className="font-serif text-xl leading-relaxed text-navy small:text-2xl">
            &ldquo;We're not just selling ceramics — we're building a community
            of people who believe the things we surround ourselves with shape
            how we feel.&rdquo;
          </Text>
        </div>
      </div>

      <div className="content-container py-16 small:py-24">
        <div className="grid grid-cols-1 items-center gap-10 small:grid-cols-2 small:gap-16">
          <div className="flex flex-col gap-4">
            <Heading level="h2">A growing collection, made with intention</Heading>
            <Text className="text-ui-fg-subtle">
              Every glaze, pattern, and shape in our collection is chosen
              because it tells a story — of the hands that made it and the
              tradition it comes from. Nothing is mass-produced, and no two
              pieces are ever quite the same.
            </Text>
            <Text className="text-ui-fg-subtle">
              Today, Emma Ceramics has grown beyond pottery to include
              textiles, home decor, and gifting collections, all chosen with
              the same care as where we started. We're always looking for new
              artisans and new friends who share our love of thoughtfully
              made things.
            </Text>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-large shadow-elevation-card-rest">
            <Image
              src="/images/about/our-story-2.png"
              alt="Colourful hand-painted ceramic figurines displayed on a shelf"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      <div className="content-container flex flex-col items-center gap-6 pb-20 text-center small:pb-28">
        <Heading level="h2">Come see for yourself</Heading>
        <Text className="max-w-xl text-ui-fg-subtle">
          Browse the full collection and find a piece that feels like it was
          made for your home.
        </Text>
        <Link href="/shop">
          <Button variant="primary" size="large">
            Shop the Collection
          </Button>
        </Link>
      </div>
    </>
  )
}

export default OurStoryTemplate
