import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Mail, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ErrorState, RecordHeader, SkeletonCard } from "@/components/site/PortalShell";
import { Switch } from "@/components/ui/switch";
import { initials, shortDate } from "@/components/portal/format";
export const Route = createFileRoute("/account/profile")({ component: Profile });
function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["portal-profile", user?.id];
  const query = useQuery({
    queryKey: key,
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const save = useMutation({
    mutationFn: async (input: {
      full_name: string;
      phone: string;
      community: string;
      address: string;
      notify_email: boolean;
      notify_sms: boolean;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ ...input, id: user!.id, email: user!.email ?? null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Your preferences are saved.");
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: ["portal-account-overview", user?.id] });
    },
    onError: () => toast.error("Couldn’t save your changes. Please try again."),
  });
  if (query.isPending) return <SkeletonCard lines={6} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const p = query.data;
  return (
    <>
      <RecordHeader
        title="Make yourself at home."
        subtitle="Your details. Your preferences. Your account."
      />
      <div className="p-profile-layout">
        <aside className="p-panel p-profile-summary">
          <span className="p-large-avatar">{initials(p?.full_name ?? user?.email)}</span>
          <h2>{p?.full_name ?? "Your account"}</h2>
          <p>{user?.email}</p>
          <span className="p-member-since">Member since {shortDate(p?.created_at)}</span>
          <div className="p-aside-note">
            <ShieldCheck size={19} />
            <strong>Your account, protected.</strong>To update your sign-in email, contact the
            Acsess team.
          </div>
        </aside>
        <form
          className="p-stack"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            save.mutate({
              full_name: String(f.get("full_name") ?? "").trim(),
              phone: String(f.get("phone") ?? "").trim(),
              community: String(f.get("community") ?? "").trim(),
              address: String(f.get("address") ?? "").trim(),
              notify_email: f.get("notify_email") === "on",
              notify_sms: f.get("notify_sms") === "on",
            });
          }}
        >
          <section className="p-panel">
            <div className="p-panel-heading">
              <div>
                <h2>Personal details</h2>
                <p>Help us reach you when it matters.</p>
              </div>
              <User size={18} className="text-slate-400" />
            </div>
            <div className="p-profile-fields">
              <label className="p-field">
                Full name
                <input
                  className="p-input"
                  name="full_name"
                  autoComplete="name"
                  defaultValue={p?.full_name ?? ""}
                  maxLength={120}
                />
              </label>
              <label className="p-field">
                Phone number
                <input
                  className="p-input"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  defaultValue={p?.phone ?? ""}
                  maxLength={40}
                />
              </label>
              <label className="p-field">
                Village or community
                <input
                  className="p-input"
                  name="community"
                  defaultValue={p?.community ?? ""}
                  maxLength={200}
                />
              </label>
              <label className="p-field">
                Contact address
                <input
                  className="p-input"
                  name="address"
                  autoComplete="street-address"
                  defaultValue={p?.address ?? ""}
                  maxLength={300}
                />
              </label>
            </div>
          </section>
          <section className="p-panel">
            <div className="p-panel-heading">
              <div>
                <h2>Stay in the loop</h2>
                <p>Choose how you’d like to hear from us.</p>
              </div>
              <Mail size={18} className="text-slate-400" />
            </div>
            <label className="p-preference-row">
              <span>
                <strong>Email updates</strong>
                <p>Service information and account updates.</p>
              </span>
              <Switch
                className="p-preference-switch"
                name="notify_email"
                defaultChecked={p?.notify_email ?? true}
                aria-label="Email updates"
              />
            </label>
            <label className="p-preference-row">
              <span>
                <strong>SMS updates</strong>
                <p>Notifications about outages and appointments.</p>
              </span>
              <Switch
                className="p-preference-switch"
                name="notify_sms"
                defaultChecked={p?.notify_sms ?? false}
                aria-label="SMS updates"
              />
            </label>
          </section>
          <div className="p-form-actions">
            <button className="p-button" type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save preferences"}
              <Check size={15} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
