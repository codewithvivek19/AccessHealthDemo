import { createFileRoute } from "@tanstack/react-router";
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
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/people", label: "People" },
  { to: "/admin/organisations", label: "Organisations" },
  { to: "/admin/content", label: "Content" },
] as const;

function AdminLayout() {
  return (
    <PortalShell
      eyebrow="Admin console"
      description="Who can access what, which organisations we work with, and what's published on the website."
      nav={NAV}
      roles={["admin"]}
    />
  );
}
