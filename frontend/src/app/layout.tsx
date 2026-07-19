import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Noto_Serif_Display, Work_Sans } from "next/font/google"
import "styles/globals.css"

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

const notoSerifDisplay = Noto_Serif_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
})

// Stopgap: Next 15.5.18 has a build-crashing bug in how it statically
// generates the /account route's parallel-route slots (@dashboard/@login)
// — see https://github.com/stuartizon/ceramics-site/issues/2. Forcing
// every route dynamic sidesteps static generation (and the crash)
// entirely, though in practice routes with generateStaticParams
// (products/categories/collections) stay statically prerendered anyway.
// Revert this once /account is restructured to not use parallel routes.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${workSans.variable} ${notoSerifDisplay.variable}`}
    >
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
