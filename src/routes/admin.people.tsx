import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/hooks/usePortalAccess";

export const Route = createFileRoute("/admin/people")({
  component: AdminPeople,
});

const ROLES: AppRole[] = ["customer", "operator", "staff", "admin"];

function AdminPeople() {
  const qc = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["admin-people"],
    queryFn: async () => {
      const [profiles, roles] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);
      if (profiles.error) throw profiles.error;
      return { profiles: profiles.data ?? [], roles: roles.data ?? [] };
    },
  });

  const toggleRole = useMutation({
    mutationFn: async ({
      userId,
      role,
      has,
    }: {
      userId: string;
      role: AppRole;
      has: boolean;
    }) => {
      if (has) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-people"] }),
  });

  return (
    <div>
      <h1 className="text-3xl font-light tracking-tight text-brand-dark">People and access</h1>
      <p className="mt-2 text-lg text-brand-dark/70">
        Give someone access to the support desk, an operator portal, or the admin console.
      </p>

      {isPending && <p className="mt-8 text-brand-dark/60">Loading…</p>}

      <ul className="mt-8 space-y-4">
        {data?.profiles.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-dark/10 p-6"
          >
            <div>
              <p className="text-lg text-brand-dark">{p.full_name ?? "Unnamed"}</p>
              <p className="text-brand-dark/60">{p.email ?? "No email on file"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => {
                const has = (data?.roles ?? []).some(
                  (r) => r.user_id === p.id && r.role === role,
                );
                return (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={has}
                    onClick={() => toggleRole.mutate({ userId: p.id, role, has })}
                    className={`rounded-full px-4 py-2 text-sm tracking-wide uppercase ${
                      has
                        ? "bg-brand-green text-white"
                        : "border border-brand-dark/15 text-brand-dark/60 hover:bg-brand-dark/5"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
