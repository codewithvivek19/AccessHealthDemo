import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, Wifi, MessageSquare, FileText, Settings2 } from "lucide-react";
import { PortalShell } from "@/components/site/PortalShell";
const NAV = [
  { to: "/account", label: "Overview", icon: <LayoutGrid />, exact: true },
  { to: "/account/services", label: "Subscriptions", icon: <Wifi /> },
  { to: "/account/support", label: "Support", icon: <MessageSquare /> },
  { to: "/account/documents", label: "Documents", icon: <FileText /> },
  { to: "/account/profile", label: "Profile & preferences", icon: <Settings2 /> },
] as const;
export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "My account — Acsess Health" }, { name: "robots", content: "noindex" }],
  }),
  component: AccountLayout,
});
function AccountLayout() {
  return (
    <PortalShell
      eyebrow="My account"
      description="Your connections. Your conversations."
      nav={NAV}
    />
  );
}
