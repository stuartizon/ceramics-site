import { retrieveCustomer } from "@lib/data/customer"
// TODO: Re-add Toaster component when needed
import AccountLayout from "@modules/account/templates/account-layout"

// This route branches on cookie-based auth state (@dashboard vs @login
// parallel slots) and can never be meaningfully static. Next 15 has a known
// bug generating a static fallback shell for parallel routes in this shape
// ("Invariant: Expected clientReferenceManifest to be defined") — forcing
// dynamic rendering skips that codepath entirely.
export const dynamic = "force-dynamic"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      {customer ? dashboard : login}
      {/* TODO: Re-add Toaster component when needed */}
    </AccountLayout>
  )
}
