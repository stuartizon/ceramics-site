import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

// Part of the same @login/@dashboard parallel-route pair as the rest of
// /account — see the account layout for why these are forced dynamic.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Emma Ceramics account.",
}

export default function Login() {
  return <LoginTemplate />
}
