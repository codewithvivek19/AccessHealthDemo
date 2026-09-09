import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Search, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole } from "@/hooks/usePortalAccess";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  DataTable,
  ErrorState,
  RecordHeader,
  SkeletonCard,
  StatCard,
} from "@/components/site/PortalShell";
import { initials, shortDate } from "@/components/portal/format";
export const Route = createFileRoute("/admin/people")({ component: AdminPeople });
const roles: { value: AppRole; label: string; description: string }[] = [
  {
    value: "customer",
    label: "Customer",
    description: "Personal services, documents, and support.",
  },
  { value: "staff", label: "Employee", description: "Customer directory and service desk access." },
  {
    value: "operator",
    label: "Operator",
    description: "Village workspace. Site records require organisation membership.",
  },
  {
    value: "admin",
    label: "Super admin",
    description: "Company-wide administration and access management.",
  },
];
function AdminPeople() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AppRole[]>([]);
  const key = ["portal-people", user?.id];
  const query = useQuery({
    queryKey: key,
    enabled: Boolean(user),
    queryFn: async () => {
      const [profiles, access] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (profiles.error) throw profiles.error;
      if (access.error) throw access.error;
      return { profiles: profiles.data, access: access.data };
    },
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!selectedId) return;
      const existing =
        query.data?.access.filter((r) => r.user_id === selectedId).map((r) => r.role) ?? [];
      const additions = draft.filter((r) => !existing.includes(r));
      const removals = existing.filter((r) => !draft.includes(r));
      if (selectedId === user?.id && removals.includes("admin"))
        throw new Error("You can’t remove your own administrator access.");
      if (additions.length) {
        const { error } = await supabase.from("user_roles").upsert(
          additions.map((role) => ({ user_id: selectedId, role })),
          { onConflict: "user_id,role" },
        );
        if (error) throw error;
      }
      if (removals.length) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", selectedId)
          .in("role", removals);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setSelectedId(null);
      toast.success("Workspace access updated.");
    },
    onError: () =>
      toast.error(
        "Some access changes may not have saved. Close and reopen this record to review before retrying.",
      ),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: ["my-roles"] });
    },
  });
  if (query.isPending) return <SkeletonCard lines={8} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const d = query.data;
  const userRoles = (id: string) => d.access.filter((r) => r.user_id === id).map((r) => r.role);
  const profiles = d.profiles.filter(
    (p) =>
      `${p.full_name ?? ""} ${p.email ?? ""}`.toLowerCase().includes(term.toLowerCase()) &&
      (filter === "all" ||
        (filter === "team"
          ? userRoles(p.id).some((r) => r === "staff" || r === "admin")
          : userRoles(p.id).includes("customer"))),
  );
  const selected = d.profiles.find((p) => p.id === selectedId);
  const team = d.profiles.filter((p) =>
    userRoles(p.id).some((r) => r === "staff" || r === "admin"),
  );
  return (
    <>
      <RecordHeader title="People & access" subtitle="The right workspace, for the right people." />
      <div className="p-stats p-stats-three">
        <StatCard
          label="Profiles in directory"
          value={d.profiles.length}
          icon={<Users />}
          hint="Up to 500 recent profiles"
        />
        <StatCard
          label="Internal team"
          value={team.length}
          icon={<Users />}
          hint="Employees & administrators in view"
        />
        <StatCard
          label="Administrators"
          value={d.profiles.filter((p) => userRoles(p.id).includes("admin")).length}
          icon={<ShieldCheck />}
          hint="Company management access in view"
        />
      </div>
      <section className="p-panel">
        <div className="p-toolbar">
          <div className="p-segments">
            {[
              { value: "all", label: "Everyone" },
              { value: "team", label: "Internal team" },
              { value: "customers", label: "Customers" },
            ].map((f) => (
              <button
                key={f.value}
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className="p-search-field">
            <Search size={15} />
            <input
              aria-label="Search people"
              placeholder="Search name or email…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </label>
        </div>
        <DataTable
          data={profiles}
          onRowClick={(p) => {
            setSelectedId(p.id);
            setDraft(userRoles(p.id));
          }}
          columns={[
            {
              header: "Person",
              sortValue: (p) => p.full_name ?? "",
              accessor: (p) => (
                <span className="p-inline-person">
                  <span className="p-customer-avatar">{initials(p.full_name ?? p.email)}</span>
                  <span>
                    {p.full_name ?? "Unnamed account"}
                    {p.id === user?.id && <span className="p-you-label">You</span>}
                    <span className="p-subtext">{p.email}</span>
                  </span>
                </span>
              ),
            },
            {
              header: "Workspace access",
              accessor: (p) => (
                <div className="p-role-badges">
                  {userRoles(p.id).map((r) => (
                    <span key={r} className={`p-role-badge ${r === "admin" ? "p-role-admin" : ""}`}>
                      {roles.find((v) => v.value === r)?.label ?? r}
                    </span>
                  ))}
                </div>
              ),
            },
            {
              header: "Joined",
              sortValue: (p) => p.created_at,
              accessor: (p) => shortDate(p.created_at),
            },
            { header: "", accessor: () => <ArrowUpRight size={15} /> },
          ]}
        />
      </section>
      <Dialog
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open && !save.isPending) setSelectedId(null);
        }}
      >
        <DialogContent className="portal-popup p-request-dialog">
          <DialogTitle>Manage workspace access</DialogTitle>
          <DialogDescription>
            {selected?.full_name ?? selected?.email} · Changes apply to this person’s available
            workspaces.
          </DialogDescription>
          <div className="p-access-options">
            {roles.map((role) => (
              <label key={role.value}>
                <input
                  type="checkbox"
                  checked={draft.includes(role.value)}
                  disabled={save.isPending || (role.value === "admin" && selectedId === user?.id)}
                  onChange={(e) =>
                    setDraft((current) =>
                      e.target.checked
                        ? [...current, role.value]
                        : current.filter((r) => r !== role.value),
                    )
                  }
                />
                <span>
                  <strong>{role.label}</strong>
                  <p>{role.description}</p>
                </span>
              </label>
            ))}
          </div>
          <div className="p-form-actions">
            <button
              className="p-button p-button-secondary"
              disabled={save.isPending}
              onClick={() => setSelectedId(null)}
            >
              Cancel
            </button>
            <button className="p-button" disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Saving…" : "Save access"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
