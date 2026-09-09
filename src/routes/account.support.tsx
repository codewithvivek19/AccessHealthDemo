import { createFileRoute } from "@tanstack/react-router";
import { SupportWorkspace } from "@/components/portal/SupportWorkspace";
export const Route = createFileRoute("/account/support")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { service?: string; ticket?: string; new?: boolean } => ({
    service: typeof search["service"] === "string" ? search["service"] : "",
    ticket: typeof search["ticket"] === "string" ? search["ticket"] : "",
    new: search["new"] === true || search["new"] === "true",
  }),
  component: AccountSupport,
});
function AccountSupport() {
  const search = Route.useSearch();
  return (
    <SupportWorkspace
      initialService={search.service ?? ""}
      initialTicket={search.ticket ?? ""}
      openNew={search.new ?? false}
    />
  );
}
