import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about/$locationId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/about/$locationId"!</div>
}
