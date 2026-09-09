import { useState, type ReactNode } from "react";
import { Link, Outlet, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import {
  LogOut, Menu, X, LayoutDashboard, Wifi, LifeBuoy, FileText, User,
  Building2, Briefcase, Users, Globe, MapPin, InboxIcon, ShieldCheck,
  ChevronRight, TrendingUp, TrendingDown, Minus, Search, Bell, Grid, ChevronDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrganisations, useRoles, type AppRole } from "@/hooks/usePortalAccess";

export type NavItem = { to: string; label: string; icon: ReactNode; exact?: boolean };

// -----------------------------------------------------------------------------
// App Header (Salesforce Global Header style)
// -----------------------------------------------------------------------------
function AppHeader({ portalName, email }: { portalName: string; email: string }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <button type="button" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden">
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded bg-primary text-white">
            <Grid className="size-4" />
          </div>
          <span className="text-sm font-semibold text-slate-800 hidden sm:block">Acsess Health CRM</span>
          <span className="text-sm font-medium text-slate-500 hidden sm:block">|</span>
          <span className="text-sm font-semibold text-primary">{portalName}</span>
        </div>
      </div>

      <div className="flex max-w-md flex-1 items-center px-8 hidden md:flex">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search Salesforce..."
            className="w-full rounded-md border border-slate-300 bg-slate-50 py-1.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <Bell className="size-5" />
        </button>
        <div className="h-6 w-px bg-slate-200 mx-1" />
        <div className="group relative">
          <button type="button" className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-slate-100 transition-colors">
            <div className="flex size-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 uppercase">
              {email.charAt(0)}
            </div>
            <ChevronDown className="size-3 text-slate-500" />
          </button>
          <div className="absolute right-0 mt-1 hidden w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg group-hover:block">
            <div className="px-4 py-2 text-xs text-slate-500 border-b border-slate-100 truncate">{email}</div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// -----------------------------------------------------------------------------
// App Sidebar (Vertical App Nav)
// -----------------------------------------------------------------------------
function AppSidebar({ nav, isOpen, setIsOpen }: { nav: readonly NavItem[]; isOpen: boolean; setIsOpen: (o: boolean) => void }) {
  const location = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 mt-14 w-60 border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="space-y-1 p-3">
          {nav.map((item) => {
            const isActive = item.exact
              ? location === item.to
              : location === item.to || location.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className={isActive ? "text-primary" : "text-slate-400"}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

// -----------------------------------------------------------------------------
// PortalShell (Main Wrapper)
// -----------------------------------------------------------------------------
export function PortalShell({
  eyebrow,
  description,
  nav,
  roles,
  orgKind,
  children,
  portalIcon,
}: {
  eyebrow: string;
  description: string;
  nav: readonly NavItem[];
  roles?: readonly AppRole[];
  orgKind?: "operator" | "developer";
  children?: ReactNode;
  portalIcon?: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session, loading: authLoading } = useAuth();
  const { roles: myRoles, loading: rolesLoading } = useRoles();
  const { organisations, loading: orgsLoading } = useMyOrganisations();
  const navigate = useNavigate();

  const loading = authLoading || rolesLoading || (Boolean(orgKind) && orgsLoading);
  const hasRole = roles ? roles.some((r) => myRoles.includes(r)) : false;
  const hasOrg = orgKind ? organisations.some((o) => o.kind === orgKind) : false;
  const allowed = myRoles.includes("admin") || hasRole || hasOrg || (!roles && !orgKind);

  if (!authLoading && !session) {
    navigate({ to: "/auth" });
    return null;
  }

  if (loading || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <ShieldCheck className="mx-auto size-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Access Restricted</h1>
          <p className="mt-2 text-sm text-slate-500">You do not have the required permissions to view this workspace.</p>
          <div className="mt-4 p-4 bg-slate-100 rounded text-left text-xs font-mono text-slate-700 overflow-auto">
            <p><strong>Debug Info:</strong></p>
            <p>myRoles: {JSON.stringify(myRoles)}</p>
            <p>required roles: {JSON.stringify(roles)}</p>
            <p>orgKind: {orgKind}</p>
            <p>myOrgs: {JSON.stringify(organisations)}</p>
            <p>allowed: {String(allowed)}</p>
            <p>loading: {String(loading)}</p>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/account" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white">Go to Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader portalName={eyebrow} email={session.user.email ?? ""} />
      <AppSidebar nav={nav} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="pt-14 lg:pl-60 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
}

// -----------------------------------------------------------------------------
// CRM Components
// -----------------------------------------------------------------------------

export function RecordHeader({
  title,
  subtitle,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex size-10 items-center justify-center rounded bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          {subtitle && <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{subtitle}</p>}
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function DataTable({
  columns,
  data,
  keyField = "id",
  onRowClick,
}: {
  columns: { header: string; accessor: (row: any) => ReactNode; className?: string }[];
  data: any[];
  keyField?: string;
  onRowClick?: (row: any) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`px-4 py-3 text-left font-semibold text-slate-700 ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                No records to display.
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row[keyField] ?? idx}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-slate-50" : ""}`}
              >
                {columns.map((col, i) => (
                  <td key={i} className={`whitespace-nowrap px-4 py-3 text-slate-700 ${col.className ?? ""}`}>
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Shared UI Primitives
// -----------------------------------------------------------------------------

const STATUS_COLOURS: Record<string, string> = {
  live: "bg-emerald-100 text-emerald-800 border-emerald-200",
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  open: "bg-blue-100 text-blue-800 border-blue-200",
  "in progress": "bg-amber-100 text-amber-800 border-amber-200",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  "on track": "bg-emerald-100 text-emerald-800 border-emerald-200",
  on_track: "bg-emerald-100 text-emerald-800 border-emerald-200",
  delayed: "bg-red-100 text-red-800 border-red-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
  suspended: "bg-orange-100 text-orange-800 border-orange-200",
  planning: "bg-violet-100 text-violet-800 border-violet-200",
  construction: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/_/g, " ");
  const colourClass = STATUS_COLOURS[key] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${colourClass}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function StatCard({
  label, value, icon, iconBg = "bg-primary/10", iconColor = "text-primary", to
}: {
  label: string; value: number | string; icon: ReactNode; iconBg?: string; iconColor?: string; to?: string;
}) {
  const inner = (
    <div className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow ${to ? "hover:shadow-md" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-md ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to as "/"}>{inner}</Link> : inner;
}

export function SkeletonCard({ lines = 2 }: { lines?: number }) {
  return (
    <div className="animate-pulse rounded-lg border border-slate-200 bg-white p-6">
      <div className="h-6 w-1/3 rounded bg-slate-200" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`mt-3 h-4 rounded bg-slate-200 ${i === 0 ? "w-2/3" : "w-1/2"}`} />
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon: ReactNode; title: string; description: string; action?: { label: string; onClick?: () => void; to?: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {action && (
        <div className="mt-6">
          {action.to ? (
            <Link to={action.to as "/"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-deep">{action.label}</Link>
          ) : (
            <button type="button" onClick={action.onClick} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-deep">{action.label}</button>
          )}
        </div>
      )}
    </div>
  );
}
