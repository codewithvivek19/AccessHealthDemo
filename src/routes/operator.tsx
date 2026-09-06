import { createFileRoute } from "@tanstack/react-router";
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
  { to: "/operator", label: "Overview", exact: true },
  { to: "/operator/sites", label: "Villages" },
  { to: "/operator/requests", label: "Requests" },
] as const;

function OperatorLayout() {
  return (
    <PortalShell
      eyebrow="Operator portal"
      description="Your villages, what's connected at each one, and the requests residents have raised."
      nav={NAV}
      roles={["operator", "staff"]}
      orgKind="operator"
    />
  );
}
