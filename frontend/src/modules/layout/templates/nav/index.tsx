import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { ShoppingCart, User } from "@medusajs/icons"
import Link from "next/link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

const TopNavLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Gift Combos", href: "/gift-combos" },
  { label: "Buying in Bulk", href: "/bulk-orders" },
  { label: "Our Story", href: "/our-story" },
]

export default async function Nav() {
  const [locales, currentLocale] = await Promise.all([
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center gap-x-6">
            <div className="h-full small:hidden">
              <SideMenu locales={locales} currentLocale={currentLocale} />
            </div>
            <Link
              href="/"
              className="font-serif text-xl tracking-wide hover:text-ui-fg-base uppercase"
              data-testid="nav-store-link"
            >
              Emma Ceramics
            </Link>
          </div>

          <div className="hidden small:flex items-center gap-x-8 h-full">
            {TopNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-ui-fg-base text-sm tracking-wide uppercase"
                data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}-link`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <Link
                className="hover:text-ui-fg-base"
                href="/account"
                data-testid="nav-account-link"
              >
                <span className="sr-only">Account</span>
                <User />
              </Link>
            </div>
            <Suspense
              fallback={
                <Link
                  className="hover:text-ui-fg-base relative flex"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <span className="sr-only">Cart</span>
                  <ShoppingCart />
                </Link>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
