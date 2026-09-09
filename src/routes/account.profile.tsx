import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, SkeletonCard } from "@/components/site/PortalShell";

export const Route = createFileRoute("/account/profile")({
  component: Profile,
});

const field =
  "mt-1.5 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20";

function Toggle({ name, defaultChecked, label }: { name: string; defaultChecked: boolean; label: string }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-5 py-4 cursor-pointer hover:bg-secondary/50 transition-colors">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="sr-only peer"
      />
      <div className="relative h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" aria-hidden />
    </label>
  );
}

function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isPending } = useQuery({
    queryKey: ["my-profile", user?.id],
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
    mutationFn: async (input: Record<string, unknown>) => {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user!.id, email: user!.email ?? null, ...input });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Your details are saved.");
      queryClient.invalidateQueries({ queryKey: ["my-profile", user?.id] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn't save that."),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} lines={1} />)}
        </div>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : (user?.email?.charAt(0).toUpperCase() ?? "?");

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title="Profile" subtitle="Keep your contact details current so we can reach you about your services." />

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-foreground">{profile?.full_name ?? "No name set"}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          const fd = new FormData(event.currentTarget);
          save.mutate({
            full_name: String(fd.get("full_name") ?? ""),
            phone: String(fd.get("phone") ?? ""),
            community: String(fd.get("community") ?? ""),
            address: String(fd.get("address") ?? ""),
            notify_email: fd.get("notify_email") === "on",
            notify_sms: fd.get("notify_sms") === "on",
          });
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="full_name" className="text-sm font-medium text-foreground">Full name</label>
            <input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} className={field} autoComplete="name" />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input id="email" value={user?.email ?? ""} readOnly className={`${field} bg-secondary cursor-not-allowed`} />
            <p className="mt-1 text-xs text-muted-foreground">Contact us to change your email address.</p>
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</label>
            <input id="phone" name="phone" defaultValue={profile?.phone ?? ""} className={field} autoComplete="tel" />
          </div>
          <div>
            <label htmlFor="community" className="text-sm font-medium text-foreground">Village or community</label>
            <input id="community" name="community" defaultValue={profile?.community ?? ""} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="text-sm font-medium text-foreground">Address</label>
            <input id="address" name="address" defaultValue={profile?.address ?? ""} className={field} autoComplete="street-address" />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Notification preferences</p>
          <Toggle name="notify_email" defaultChecked={profile?.notify_email ?? true} label="Email me about my services" />
          <Toggle name="notify_sms" defaultChecked={profile?.notify_sms ?? false} label="Text me about outages and appointments" />
        </div>

        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-deep disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
