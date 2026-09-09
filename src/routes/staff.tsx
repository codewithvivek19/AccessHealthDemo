import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Users, InboxIcon } from "lucide-react";
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
  {
    to: "/staff",
    label: "Service desk",
    icon: <LayoutDashboard className="size-5" aria-hidden />,
    exact: true,
  },
  {
    to: "/staff/customers",
    label: "Customer directory",
    icon: <Users className="size-5" aria-hidden />,
  },
  {
    to: "/staff/enquiries",
    label: "Enquiries",
    icon: <InboxIcon className="size-5" aria-hidden />,
  },
] as const;

function StaffLayout() {
  return (
    <PortalShell
      eyebrow="Service workspace"
      description="Thoughtful service. Every day."
      nav={NAV}
      roles={["staff", "admin"]}
      portalIcon={<LayoutDashboard className="size-5" />}
    />
  );
}
