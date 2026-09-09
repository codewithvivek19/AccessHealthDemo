import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, MapPin, LifeBuoy } from "lucide-react";
import { PortalShell } from "@/components/site/PortalShell";

export const Route = createFileRoute("/operator")({
  head: () => ({
    meta: [
      { title: "Operator portal — Acsess Health" },
      { name: "description", content: "Village operator view of sites, services and requests." },
      { property: "og:title", content: "Operator portal — Acsess Health" },
      { property: "og:description", content: "Your villages, services and resident requests." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OperatorLayout,
});

const NAV = [
  { to: "/operator", label: "Overview", icon: <LayoutDashboard className="size-5" aria-hidden />, exact: true },
  { to: "/operator/sites", label: "Villages", icon: <MapPin className="size-5" aria-hidden /> },
  { to: "/operator/requests", label: "Requests", icon: <LifeBuoy className="size-5" aria-hidden /> },
] as const;

function OperatorLayout() {
  return (
    <PortalShell
      eyebrow="Operator portal"
      description="Your villages, what is connected, and resident requests."
      nav={NAV}
      roles={["operator", "staff"]}
      orgKind="operator"
      portalIcon={<MapPin className="size-5" />}
    />
  );
}
