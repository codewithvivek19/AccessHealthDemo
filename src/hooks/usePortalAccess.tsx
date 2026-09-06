import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];
export type Organisation = Database["public"]["Tables"]["organisations"]["Row"];

export function useRoles() {
  const { user, loading } = useAuth();
  const query = useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role as AppRole);
    },
  });

  return {
    roles: query.data ?? [],
    loading: loading || (Boolean(user) && query.isPending),
  };
}

export function useMyOrganisations() {
  const { user, loading } = useAuth();
  const query = useQuery({
    queryKey: ["my-organisations", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organisation_members")
        .select("organisation_id, title, organisations(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? [])
        .map((row) => row.organisations as Organisation | null)
        .filter((org): org is Organisation => Boolean(org));
    },
  });

  return {
    organisations: query.data ?? [],
    loading: loading || (Boolean(user) && query.isPending),
  };
}
