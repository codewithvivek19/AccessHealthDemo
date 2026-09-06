import { createServerFn } from "@tanstack/react-start";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "./demo-accounts";

const RIVERBEND_ORG = "11111111-1111-4111-8111-111111111111";

/**
 * Creates (or repairs) the three demo sign-ins used on the login page.
 * Safe to call repeatedly.
 */
export const ensureDemoAccounts = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const created: string[] = [];

  for (const account of DEMO_ACCOUNTS) {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    let user = list?.users.find((u) => u.email?.toLowerCase() === account.email);

    if (!user) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: `${account.label} demo` },
      });
      if (error) throw error;
      user = data.user ?? undefined;
      created.push(account.email);
    } else {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
    }
    if (!user) continue;

    if (account.key === "operator") {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: user.id, role: "operator" }, { onConflict: "user_id,role" });
      await supabaseAdmin
        .from("organisation_members")
        .upsert(
          { user_id: user.id, organisation_id: RIVERBEND_ORG, title: "Operations manager" },
          { onConflict: "organisation_id,user_id" },
        );
    }

    if (account.key === "employee") {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: user.id, role: "staff" }, { onConflict: "user_id,role" });
    }

    if (account.key === "customer") {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: user.id, role: "customer" }, { onConflict: "user_id,role" });
    }
  }

  return { ok: true, created };
});
