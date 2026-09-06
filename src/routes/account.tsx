import { useEffect } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrganisations, useRoles } from "@/hooks/usePortalAccess";
import { ACCOUNT_NAV } from "@/lib/site";

function WorkspaceLinks() {
  const { roles } = useRoles();
  const { organisations } = useMyOrganisations();

  const links: { to: "/staff" | "/operator" | "/developer" | "/admin"; label: string }[] = [];
  if (roles.includes("staff") || roles.includes("admin"))
    links.push({ to: "/staff", label: "Support desk" });
  if (roles.includes("operator") || roles.includes("admin") || organisations.some((o) => o.kind === "operator"))
    links.push({ to: "/operator", label: "Operator portal" });
  if (roles.includes("admin") || organisations.some((o) => o.kind === "developer"))
    links.push({ to: "/developer", label: "Project portal" });
  if (roles.includes("admin")) links.push({ to: "/admin", label: "Admin console" });

  if (!links.length) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl bg-secondary/60 p-5">
      <span className="text-sm tracking-wide text-muted-foreground uppercase">Your workspaces</span>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="rounded-full bg-primary px-5 py-2 text-sm tracking-wide text-primary-foreground uppercase hover:opacity-90"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account — Acsess Health" },
      { name: "description", content: "Your Acsess Health services, support requests and documents." },
      { property: "og:title", content: "My account — Acsess Health" },
      { property: "og:description", content: "Your services, support requests and documents." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

function AccountLayout() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <p className="text-lg text-muted-foreground">Loading your account…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-primary">My account</p>
          <p className="mt-2 text-lg text-muted-foreground">Signed in as {session.user.email}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 text-lg font-medium hover:bg-secondary"
        >
          <LogOut className="size-5" aria-hidden />
          Sign out
        </button>
      </div>

      <WorkspaceLinks />

      <nav aria-label="Account" className="mt-8 flex flex-wrap gap-2 border-b border-border pb-4">
        {ACCOUNT_NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: "exact" in item ? item.exact : false }}
            className="rounded-sm px-4 py-2.5 text-lg font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-primary/10 text-primary" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-10">
        <Outlet />
      </div>
    </div>
  );
}
