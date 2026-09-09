import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, MapPin } from "lucide-react";
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
  { to: "/developer", label: "Projects", icon: <Briefcase className="size-5" aria-hidden />, exact: true },
  { to: "/developer/sites", label: "Sites", icon: <MapPin className="size-5" aria-hidden /> },
] as const;

function DeveloperLayout() {
  return (
    <PortalShell
      eyebrow="Project portal"
      description="Where each of your network builds is up to, milestone by milestone."
      nav={NAV}
      roles={["staff"]}
      orgKind="developer"
      portalIcon={<Briefcase className="size-5" />}
    />
  );
}
