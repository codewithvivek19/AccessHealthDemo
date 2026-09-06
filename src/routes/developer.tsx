import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/site/PortalShell";

export const Route = createFileRoute("/developer")({
  head: () => ({
    meta: [
      { title: "Project portal — Acsess Health" },
      { name: "description", content: "Developer view of Acsess network build projects." },
      { property: "og:title", content: "Project portal — Acsess Health" },
      { property: "og:description", content: "Track your network build projects and milestones." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DeveloperLayout,
});

const NAV = [
  { to: "/developer", label: "Projects", exact: true },
  { to: "/developer/sites", label: "Sites" },
] as const;

function DeveloperLayout() {
  return (
    <PortalShell
      eyebrow="Project portal"
      description="Where each of your network builds is up to, milestone by milestone."
      nav={NAV}
      roles={["staff"]}
      orgKind="developer"
    />
  );
}
