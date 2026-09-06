import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/account/profile")({
  component: Profile,
});

const field =
  "mt-2 w-full rounded-sm border border-input bg-background px-4 py-3 text-lg outline-none transition-colors focus-visible:border-primary";

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

  if (isPending) return <p className="text-lg text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Keep your contact details current so we can reach you about your services.
      </p>

      <form
        className="mt-8 space-y-6"
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
        <div>
          <label htmlFor="full_name" className="text-lg font-medium">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            defaultValue={profile?.full_name ?? ""}
            className={field}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-lg font-medium">
            Email
          </label>
          <input id="email" value={user?.email ?? ""} readOnly className={`${field} bg-secondary`} />
          <p className="mt-2 text-sm text-muted-foreground">
            Contact us if you need to change the email on your account.
          </p>
        </div>
        <div>
          <label htmlFor="phone" className="text-lg font-medium">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={profile?.phone ?? ""}
            className={field}
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="community" className="text-lg font-medium">
            Village or community
          </label>
          <input id="community" name="community" defaultValue={profile?.community ?? ""} className={field} />
        </div>
        <div>
          <label htmlFor="address" className="text-lg font-medium">
            Address
          </label>
          <input id="address" name="address" defaultValue={profile?.address ?? ""} className={field} />
        </div>

        <fieldset className="rounded-sm border border-border p-6">
          <legend className="px-2 text-lg font-medium">How we contact you</legend>
          <label className="flex items-center gap-3 py-2 text-lg">
            <input
              type="checkbox"
              name="notify_email"
              defaultChecked={profile?.notify_email ?? true}
              className="size-5 accent-[var(--color-primary)]"
            />
            Email me about my services
          </label>
          <label className="flex items-center gap-3 py-2 text-lg">
            <input
              type="checkbox"
              name="notify_sms"
              defaultChecked={profile?.notify_sms ?? false}
              className="size-5 accent-[var(--color-primary)]"
            />
            Text me about outages and appointments
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-sm bg-primary px-7 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-deep disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
