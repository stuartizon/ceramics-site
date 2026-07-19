import { retrieveCustomer } from "@lib/data/customer"
// TODO: Re-add Toaster component when needed
import AccountLayout from "@modules/account/templates/account-layout"
import LoginTemplate from "@modules/account/templates/login-template"

// This route branches on cookie-based auth state and can never be
// meaningfully static.
export const dynamic = "force-dynamic"

export default async function AccountPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      {customer ? children : <LoginTemplate />}
      {/* TODO: Re-add Toaster component when needed */}
    </AccountLayout>
  )
}
