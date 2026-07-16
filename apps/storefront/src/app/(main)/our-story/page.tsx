import { Metadata } from "next"

import OurStoryTemplate from "@modules/our-story/templates"

export const metadata: Metadata = {
  title: "Our Story",
  description: "Learn about Emma Ceramics and the artisans behind our handmade collections.",
}

export default function OurStoryPage() {
  return <OurStoryTemplate />
}
