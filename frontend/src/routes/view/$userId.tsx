import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/view/$userId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/view/$userId"!</div>
}
