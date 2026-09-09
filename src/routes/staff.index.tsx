import { createFileRoute } from "@tanstack/react-router";
import { SupportWorkspace } from "@/components/portal/SupportWorkspace";
export const Route = createFileRoute("/staff/")({
  validateSearch: (search: Record<string, unknown>): { ticket?: string } =>
    typeof search["ticket"] === "string" ? { ticket: search["ticket"] } : {},
  component: StaffQueue,
});
function StaffQueue() {
  const { ticket } = Route.useSearch();
  return <SupportWorkspace staff initialTicket={ticket ?? ""} />;
}
