import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/site/PortalShell";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Support desk — Acsess Health" },
      { name: "description", content: "Acsess team workspace for customer support requests." },
      { property: "og:title", content: "Support desk — Acsess Health" },
      { property: "og:description", content: "Acsess team workspace for support requests." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StaffLayout,
});

const NAV = [
  { to: "/staff", label: "Queue", exact: true },
  { to: "/staff/customers", label: "Customers" },
  { to: "/staff/enquiries", label: "Enquiries" },
] as const;

function StaffLayout() {
  return (
    <PortalShell
      eyebrow="Acsess support desk"
      description="Every customer request in one queue — reply, change status and see who the customer is."
      nav={NAV}
      roles={["staff", "admin"]}
    />
  );
}
