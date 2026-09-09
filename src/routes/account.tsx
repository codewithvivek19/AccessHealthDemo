import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { LayoutDashboard, Wifi, LifeBuoy, FileText, User } from "lucide-react";
import { PortalShell } from "@/components/site/PortalShell";
import { useRoles, useMyOrganisations } from "@/hooks/usePortalAccess";

const ACCOUNT_NAV = [
  { to: "/account", label: "Overview", icon: <LayoutDashboard className="size-5" aria-hidden />, exact: true },
  { to: "/account/services", label: "My services", icon: <Wifi className="size-5" aria-hidden /> },
  { to: "/account/support", label: "Support", icon: <LifeBuoy className="size-5" aria-hidden /> },
  { to: "/account/documents", label: "Documents", icon: <FileText className="size-5" aria-hidden /> },
  { to: "/account/profile", label: "Profile", icon: <User className="size-5" aria-hidden /> },
] as const;

function WorkspaceLinks() {
  const { roles } = useRoles();
  const { organisations } = useMyOrganisations();

  const links: { to: string; label: string }[] = [];
  if (roles.includes("staff") || roles.includes("admin"))
    links.push({ to: "/staff", label: "Support Desk" });
  if (roles.includes("admin") || organisations.some((o) => o.kind === "operator"))
    links.push({ to: "/operator", label: "Operator Portal" });
  if (roles.includes("admin") || organisations.some((o) => o.kind === "developer"))
    links.push({ to: "/developer", label: "Project Portal" });
  if (roles.includes("admin")) links.push({ to: "/admin", label: "Admin Console" });

  if (!links.length) return null;

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">My Workspaces</p>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account — Acsess Health" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

function AccountLayout() {
  return (
    <PortalShell
      eyebrow="My account"
      description="Your Acsess Health services and support."
      portalIcon={<User className="size-5" />}
      nav={ACCOUNT_NAV}
    >
      <WorkspaceLinks />
      <Outlet />
    </PortalShell>
  );
}
