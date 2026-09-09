import { useEffect, useState, type ReactNode } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command,
  Globe,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useMyOrganisations, useRoles, type AppRole } from "@/hooks/usePortalAccess";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export type NavItem = { to: string; label: string; icon: ReactNode; exact?: boolean };

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
  portalIcon?: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const { session, loading: authLoading, signOut } = useAuth();
  const { roles: myRoles, loading: rolesLoading } = useRoles();
  const { organisations, loading: orgsLoading } = useMyOrganisations();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const customer = pathname.startsWith("/account");
  const loading = authLoading || rolesLoading || (Boolean(orgKind) && orgsLoading);
  const allowed =
    myRoles.includes("admin") ||
    (roles?.some((r) => myRoles.includes(r)) ?? false) ||
    (orgKind ? organisations.some((o) => o.kind === orgKind) : !roles);
  const active = nav.find((n) =>
    n.exact ? pathname.replace(/\/$/, "") === n.to : pathname.startsWith(n.to),
  );
  const workspaces = [{ to: "/account", label: "Personal account" }];
  if (myRoles.includes("staff") || myRoles.includes("admin"))
    workspaces.push({ to: "/staff", label: "Service workspace" });
  if (
    myRoles.includes("operator") ||
    myRoles.includes("staff") ||
    myRoles.includes("admin") ||
    organisations.some((o) => o.kind === "operator")
  )
    workspaces.push({ to: "/operator", label: "Village operations" });
  if (
    myRoles.includes("staff") ||
    myRoles.includes("admin") ||
    organisations.some((o) => o.kind === "developer")
  )
    workspaces.push({ to: "/developer", label: "Project workspace" });
  if (myRoles.includes("admin")) workspaces.push({ to: "/admin", label: "Administration" });

  useEffect(() => {
    if (!authLoading && !session) void navigate({ to: "/auth" });
  }, [authLoading, session, navigate]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sidebar = (
    <>
      <Link to="/" className="p-brand" aria-label="Acsess Health home">
        <span className="p-brand-symbol">
          a<span />
        </span>
        <span>
          acsess<span className="p-brand-health">HEALTH</span>
        </span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-workspace">
          <span className="p-workspace-icon">
            <LayoutGrid size={17} />
          </span>
          <span>
            <small>Workspace</small>
            <strong>{eyebrow}</strong>
          </span>
          <ChevronDown size={14} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="portal-popup min-w-60">
          <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
          {workspaces.map((w) => (
            <DropdownMenuItem key={w.to} asChild>
              <Link to={w.to}>{w.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="p-nav-label">{customer ? "YOUR ACCOUNT" : "WORKSPACE"}</p>
      <nav aria-label={`${eyebrow} navigation`} className="p-nav">
        {nav.map((item) => {
          const selected = item.exact
            ? pathname.replace(/\/$/, "") === item.to
            : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={selected ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className={selected ? "is-active" : ""}
            >
              {item.icon}
              <span>{item.label}</span>
              {selected && <span className="p-nav-active" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-sidebar-bottom">
        <div className="p-help">
          <HelpCircle size={20} />
          <strong>
            {customer ? "A little help, whenever you need it." : "Connected to better care."}
          </strong>
          <p>
            {customer
              ? "Your Acsess team is a conversation away."
              : "Your people. Your communities. One workspace."}
          </p>
          <Link to={customer ? "/account/support" : "/support"}>
            {customer ? "Contact support" : "Support resources"}
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <Link to="/" className="p-site-link">
          <Globe size={16} /> Visit Acsess website
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </>
  );

  if (loading || !session)
    return (
      <div className="portal p-auth-state">
        <div className="p-loading-orbit" />
        <p>Opening your workspace…</p>
      </div>
    );
  if (!allowed)
    return (
      <div className="portal p-auth-state">
        <ShieldCheck size={34} />
        <h1>This workspace needs access.</h1>
        <p>Switch to your account or contact your administrator.</p>
        <Link to="/account" className="p-button">
          Open my account
        </Link>
      </div>
    );

  return (
    <div className={`portal ${customer ? "portal-customer" : "portal-employee"}`}>
      <a href="#workspace-content" className="p-skip">
        Skip to content
      </a>
      <aside className="p-sidebar">{sidebar}</aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="portal p-mobile-sidebar">
          <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Choose a page or switch workspace.
          </SheetDescription>
          {sidebar}
        </SheetContent>
      </Sheet>
      <div className="p-main">
        <header className="p-topbar">
          <div className="p-breadcrumb">
            <button
              className="p-icon-button p-mobile-menu"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <span>{eyebrow}</span>
            <ChevronRight size={13} />
            <strong>{active?.label ?? "Overview"}</strong>
          </div>
          <div className="p-topbar-actions">
            <button
              className="p-search-trigger"
              onClick={() => {
                setTerm("");
                setSearchOpen(true);
              }}
            >
              <Search size={16} />
              <span>Jump to a page</span>
              <kbd>⌘ K</kbd>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-avatar" aria-label="Account menu">
                {session.user.email?.charAt(0).toUpperCase()}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="portal-popup">
                <DropdownMenuLabel className="max-w-64 truncate">
                  {session.user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account/profile">Profile & preferences</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    void signOut()
                      .then(() => navigate({ to: "/" }))
                      .catch(() => toast.error("Couldn’t sign out. Please try again."));
                  }}
                >
                  <LogOut size={15} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main id="workspace-content" className="p-content">
          <div className="p-section-eyebrow">
            <span>{customer ? "ACSESS, AT YOUR SERVICE" : "ACSESS HEALTH"}</span>
            <span>{description}</span>
          </div>
          {children ?? <Outlet />}
        </main>
        <footer className="p-footer">
          <span>Acsess Health</span>
          <span>Connected communities. Considered service.</span>
        </footer>
      </div>
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="portal-popup p-command">
          <DialogTitle className="sr-only">Jump to a page</DialogTitle>
          <DialogDescription className="sr-only">
            Search pages available in your workspace.
          </DialogDescription>
          <div className="p-command-input">
            <Search size={20} />
            <input
              autoFocus
              aria-label="Search pages"
              placeholder="Where would you like to go?"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
          <div className="p-command-results">
            {[...nav, ...workspaces.filter((w) => !nav.some((n) => n.to === w.to))]
              .filter((n) => n.label.toLowerCase().includes(term.toLowerCase()))
              .map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setSearchOpen(false)}>
                  <span>{n.label}</span>
                  <ArrowUpRight size={17} />
                </Link>
              ))}
            {![...nav, ...workspaces].some((n) =>
              n.label.toLowerCase().includes(term.toLowerCase()),
            ) && <p>No matching pages.</p>}
          </div>
          <div className="p-command-footer">
            <Command size={13} /> Quick navigation <span>Esc to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function RecordHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="p-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="p-header-actions">{actions}</div>}
    </div>
  );
}
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return <RecordHeader title={title} {...(subtitle ? { subtitle } : {})} actions={action} />;
}

type Column<T> = {
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
  sortValue?: (row: T) => string | number;
};
export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
}: {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  onRowClick?: (row: T) => void;
}) {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ index: number; direction: number } | null>(null);
  const pageSize = 10;
  const sorted = [...data];
  if (sort) {
    const accessor = columns[sort.index]?.sortValue;
    if (accessor)
      sorted.sort((a, b) => {
        const x = accessor(a);
        const y = accessor(b);
        return (
          (typeof x === "number" && typeof y === "number"
            ? x - y
            : String(x).localeCompare(String(y))) * sort.direction
        );
      });
  }
  const currentPage = Math.min(page, Math.max(0, Math.ceil(data.length / pageSize) - 1));
  return (
    <div className="p-table-panel">
      <div className="p-table-scroll">
        <table className="p-table">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className={c.className}
                  scope="col"
                  aria-sort={
                    sort?.index === i
                      ? sort.direction === 1
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {c.sortValue ? (
                    <button
                      onClick={() => {
                        setSort({ index: i, direction: sort?.index === i ? -sort.direction : 1 });
                        setPage(0);
                      }}
                    >
                      {c.header}
                      {sort?.index === i ? (
                        sort.direction === 1 ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ChevronDown size={12} />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize).map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "p-clickable-row" : ""}
              >
                {columns.map((c, i) => (
                  <td key={i} className={c.className}>
                    {onRowClick && i === 0 ? (
                      <button
                        className="p-record-link"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRowClick(row);
                        }}
                      >
                        {c.accessor(row)}
                      </button>
                    ) : (
                      c.accessor(row)
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-table-empty">
                  No records match this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-table-footer">
        <span>
          {data.length
            ? `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, data.length)} of ${data.length} records`
            : "0 records"}
        </span>
        <div>
          <button
            aria-label="Previous page"
            className="p-icon-button"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            aria-label="Next page"
            className="p-icon-button"
            disabled={(currentPage + 1) * pageSize >= data.length}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, " ");
  const tone = /^(active|live|complete|completed|on_track)$/.test(status)
    ? "green"
    : /^(urgent|delayed|at_risk)$/.test(status)
      ? "red"
      : /^(in_progress|pending|construction|installing|installation|suspended)$/.test(status)
        ? "amber"
        : /^(open|planning|design)$/.test(status)
          ? "blue"
          : "gray";
  return (
    <span className={`p-status p-status-${tone}`}>
      <span />
      {label}
    </span>
  );
}
export function StatCard({
  label,
  value,
  icon,
  to,
  hint,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  to?: string;
  hint?: string;
}) {
  const content = (
    <>
      <div className="p-stat-label">
        <span>{label}</span>
        {icon}
      </div>
      <div className="p-stat-value">{value}</div>
      {hint && <p className="p-stat-hint">{hint}</p>}
      {to && <ArrowUpRight className="p-stat-arrow" size={15} />}
    </>
  );
  return to ? (
    <Link to={to} className="p-stat">
      {content}
    </Link>
  ) : (
    <div className="p-stat">{content}</div>
  );
}
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="p-panel p-skeleton" role="status" aria-label="Loading records">
      <span className="sr-only">Loading…</span>
      <div />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} />
      ))}
    </div>
  );
}
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick?: () => void; to?: string };
}) {
  return (
    <div className="p-empty">
      <div className="p-empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action &&
        (action.to ? (
          <Link to={action.to} className="p-button p-button-secondary">
            {action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="p-button p-button-secondary">
            {action.label}
          </button>
        ))}
    </div>
  );
}
export function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="p-error" role="alert">
      <div>
        <strong>We couldn’t load these records.</strong>
        <p>Your information is safe. Please try again.</p>
      </div>
      <button className="p-button p-button-secondary" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
