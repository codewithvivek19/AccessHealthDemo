import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Users, Shield, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/hooks/usePortalAccess";
import { SkeletonCard, EmptyState, RecordHeader, DataTable } from "@/components/site/PortalShell";

export const Route = createFileRoute("/admin/people")({
  component: AdminPeople,
});

const ALL_ROLES = ["admin", "staff", "operator", "developer"] as const;
type DisplayRole = (typeof ALL_ROLES)[number];

const ROLE_COLOUR: Record<DisplayRole, string> = {
  admin: "bg-red-100 text-red-800 border-red-200",
  staff: "bg-blue-100 text-blue-800 border-blue-200",
  operator: "bg-violet-100 text-violet-800 border-violet-200",
  developer: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

function AdminPeople() {
  const qc = useQueryClient();
  const [term, setTerm] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["admin-people"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (profiles.error) throw profiles.error;
      return { profiles: profiles.data ?? [], roles: roles.data ?? [] };
    },
  });

  const toggleRole = useMutation({
    mutationFn: async ({ userId, role, has }: { userId: string; role: AppRole; has: boolean }) => {
      if (has) {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Role updated.");
      qc.invalidateQueries({ queryKey: ["admin-people"] });
    },
    onError: () => toast.error("Couldn't update role."),
  });

  const q = term.trim().toLowerCase();
  const profiles = (data?.profiles ?? []).filter((p) =>
    !q ? true : [p.full_name, p.email].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
  );

  const userRoles = (userId: string) =>
    (data?.roles ?? []).filter((r) => r.user_id === userId).map((r) => r.role as DisplayRole);

  if (isPending) return <SkeletonCard lines={6} />;

  return (
    <div className="space-y-6">
      <RecordHeader
        title="Users"
        subtitle={`${data?.profiles.length ?? 0} total accounts`}
        icon={<Users className="size-5" />}
        actions={
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search" value={term} onChange={(e) => setTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded border border-slate-300 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        }
      />

      {!profiles.length ? (
        <EmptyState icon={<Users className="size-7" />} title="No users found" description="Try a different search." />
      ) : (
        <DataTable
          data={profiles}
          columns={[
            {
              header: "User",
              accessor: (r) => (
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-500 uppercase">
                    {(r.full_name ?? r.email ?? "?").charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{r.full_name ?? "Unnamed"}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1"><Mail className="size-3" /> {r.email}</p>
                  </div>
                </div>
              )
            },
            {
              header: "Platform Access & Roles",
              accessor: (r) => {
                const roles = userRoles(r.id);
                return (
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_ROLES.map((role) => {
                      const has = roles.includes(role);
                      return (
                        <button
                          key={role}
                          onClick={() => toggleRole.mutate({ userId: r.id, role: role as AppRole, has })}
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                            has ? ROLE_COLOUR[role] : "border-slate-200 text-slate-400 hover:border-primary/50 hover:text-slate-600"
                          }`}
                        >
                          {has && <Shield className="size-3" />}
                          {role}
                        </button>
                      );
                    })}
                  </div>
                );
              }
            },
            {
              header: "Joined",
              accessor: (r) => <span className="text-slate-600">{new Date(r.created_at).toLocaleDateString("en-AU")}</span>
            }
          ]}
        />
      )}
    </div>
  );
}
