import { useEffect, type ReactNode } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrganisations, useRoles, type AppRole } from "@/hooks/usePortalAccess";

type NavItem = { to: string; label: string; exact?: boolean };

export function PortalShell({
  eyebrow,
  description,
  nav,
  roles,
  orgKind,
  children,
}: {
  eyebrow: string;
  description: string;
  nav: readonly NavItem[];
  roles?: readonly AppRole[];
  orgKind?: "operator" | "developer";
  children?: ReactNode;
}) {
  const { session, loading: authLoading, signOut } = useAuth();
  const { roles: myRoles, loading: rolesLoading } = useRoles();
  const { organisations, loading: orgsLoading } = useMyOrganisations();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/auth" });
  }, [authLoading, session, navigate]);

  const loading = authLoading || rolesLoading || (Boolean(orgKind) && orgsLoading);

  const hasRole = roles ? roles.some((r) => myRoles.includes(r)) : false;
  const hasOrg = orgKind ? organisations.some((o) => o.kind === orgKind) : false;
  const allowed = myRoles.includes("admin") || hasRole || hasOrg;

  if (loading || !session) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <p className="text-lg text-brand-dark/60">Loading…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 lg:px-8">
        <p className="text-sm tracking-[0.2em] text-brand-green uppercase">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-light tracking-tight text-brand-dark">
          You don't have access to this area
        </h1>
        <p className="mt-4 text-lg text-brand-dark/70">
          This workspace is for Acsess team members and partner organisations. If you think you
          should have access, contact us and we'll set it up.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/account"
            className="inline-flex items-center rounded-full bg-brand-dark px-6 py-3 text-sm tracking-wide text-white uppercase hover:bg-brand-green"
          >
            Go to my account
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center rounded-full border border-brand-dark/20 px-6 py-3 text-sm tracking-wide text-brand-dark uppercase hover:bg-brand-dark/5"
          >
            Contact Acsess
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.2em] text-brand-green uppercase">{eyebrow}</p>
          <p className="mt-3 max-w-xl text-lg text-brand-dark/70">{description}</p>
          <p className="mt-1 text-brand-dark/50">Signed in as {session.user.email}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
          className="inline-flex items-center gap-2 rounded-full border border-brand-dark/20 px-5 py-2.5 text-sm tracking-wide text-brand-dark uppercase hover:bg-brand-dark/5"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </div>

      <nav
        aria-label={eyebrow}
        className="mt-8 flex flex-wrap gap-2 border-b border-brand-dark/10 pb-4"
      >
        {nav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact ?? false }}
            className="rounded-full px-4 py-2 text-sm tracking-wide text-brand-dark/60 uppercase hover:bg-brand-dark/5 hover:text-brand-dark"
            activeProps={{ className: "bg-brand-dark text-white hover:bg-brand-dark" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-10">{children ?? <Outlet />}</div>
    </div>
  );
}

export function StatCards({
  items,
}: {
  items: { label: string; value: number | string; hint?: string }[];
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-brand-dark/10 p-6">
          <p className="text-4xl font-light text-brand-dark">{item.value}</p>
          <p className="mt-2 text-brand-dark/70">{item.label}</p>
          {item.hint && <p className="mt-1 text-sm text-brand-dark/50">{item.hint}</p>}
        </div>
      ))}
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-brand-dark/5 px-3 py-1 text-sm text-brand-dark capitalize">
      {children}
    </span>
  );
}
