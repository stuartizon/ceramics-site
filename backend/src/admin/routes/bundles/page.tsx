import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CubeSolid } from "@medusajs/icons"
import { Button, Container, Heading, Table, Text, clx } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { sdk } from "../../lib/sdk"
import { AdminBundle } from "./types"

const BundleStatusCell = ({ status }: { status: AdminBundle["status"] }) => {
  const color = status === "published" ? "green" : "grey"
  const label = status === "published" ? "Published" : "Draft"

  return (
    <div className="txt-compact-small text-ui-fg-subtle flex h-full w-full items-center gap-x-2 overflow-hidden">
      <div role="presentation" className="flex h-5 w-2 items-center justify-center">
        <div
          className={clx(
            "h-2 w-2 rounded-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.12)_inset]",
            {
              "bg-ui-tag-neutral-icon": color === "grey",
              "bg-ui-tag-green-icon": color === "green",
            }
          )}
        />
      </div>
      <span className="truncate">{label}</span>
    </div>
  )
}

const BundlesPage = () => {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ["bundles"],
    queryFn: () =>
      sdk.client.fetch<{ bundles: AdminBundle[] }>("/admin/bundles"),
  })

  const bundles = data?.bundles ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Bundles</Heading>
        <Button size="small" variant="secondary" onClick={() => navigate("create")}>
          Create
        </Button>
      </div>
      {!isLoading && bundles.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <Text className="text-ui-fg-subtle">No bundles yet.</Text>
        </div>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Handle</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Products</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {bundles.map((bundle) => (
              <Table.Row
                key={bundle.id}
                className="cursor-pointer"
                onClick={() => navigate(bundle.id)}
              >
                <Table.Cell>{bundle.title}</Table.Cell>
                <Table.Cell>{bundle.handle}</Table.Cell>
                <Table.Cell>
                  <BundleStatusCell status={bundle.status} />
                </Table.Cell>
                <Table.Cell>{bundle.products.length}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Bundles",
  icon: CubeSolid,
})

export default BundlesPage
