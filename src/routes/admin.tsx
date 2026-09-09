import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Users, Building2, Globe } from "lucide-react";
import { PortalShell } from "@/components/site/PortalShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — Acsess Health" },
      { name: "description", content: "Manage people, organisations and published content." },
      { property: "og:title", content: "Admin console — Acsess Health" },
      { property: "og:description", content: "People, organisations and published content." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: <LayoutDashboard className="size-5" aria-hidden />, exact: true },
  { to: "/admin/people", label: "People", icon: <Users className="size-5" aria-hidden /> },
  { to: "/admin/organisations", label: "Organisations", icon: <Building2 className="size-5" aria-hidden /> },
  { to: "/admin/content", label: "Content", icon: <Globe className="size-5" aria-hidden /> },
] as const;

function AdminLayout() {
  return (
    <PortalShell
      eyebrow="Admin console"
      description="People, organisations and published content."
      nav={NAV}
      roles={["admin"]}
      portalIcon={<LayoutDashboard className="size-5" />}
    />
  );
}
