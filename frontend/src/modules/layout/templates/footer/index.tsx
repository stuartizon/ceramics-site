import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { Text, clx } from "@modules/common/components/ui";

import Link from "next/link"
import MedusaCTA from "@modules/layout/components/medusa-cta";

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  });
  const productCategories = await listCategories();

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-16">
          <div>
            <Link
              href="/"
              className="font-serif text-xl tracking-wide text-ui-fg-subtle hover:text-ui-fg-base uppercase"
            >
              Emma Ceramics
            </Link>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-4">
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Info</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <Link
                    className="hover:text-ui-fg-base"
                    href="/our-story"
                  >
                    Our Story
                  </Link>
                </li>
              </ul>
            </div>
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Categories
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories
                    ?.filter((c) => !c.parent_category)
                    .slice(0, 6)
                    .map((c) => (
                      <li
                        className="flex flex-col gap-2 text-ui-fg-subtle txt-small"
                        key={c.id}
                      >
                        <Link
                          className="hover:text-ui-fg-base"
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Collections
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <Link
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">
                Customer Service
              </span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <Link
                    className="hover:text-ui-fg-base"
                    href="/shipping-policy"
                  >
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-ui-fg-base"
                    href="/refund-policy"
                  >
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-ui-fg-base"
                    href="/privacy-policy"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-ui-fg-base"
                    href="/terms-of-service"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-8 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Emma Ceramics. All rights reserved.
          </Text>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  );
}
