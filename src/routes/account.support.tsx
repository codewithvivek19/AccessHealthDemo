import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CONTACT } from "@/lib/site";

export const Route = createFileRoute("/account/support")({
  component: AccountSupport,
});

const field =
  "mt-2 w-full rounded-sm border border-input bg-background px-4 py-3 text-lg outline-none transition-colors focus-visible:border-primary";

const CATEGORIES = ["Internet", "Television", "Telephone", "Billing", "Something else"];

function reference() {
  return `ACS-${Date.now().toString().slice(-6)}`;
}

function AccountSupport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: tickets, isPending } = useQuery({
    queryKey: ["my-tickets", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async (input: { subject: string; category: string; description: string }) => {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user!.id,
        reference: reference(),
        subject: input.subject,
        category: input.category,
        description: input.description,
        status: "open",
        priority: "normal",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request logged. We'll be in touch.");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my-tickets", user?.id] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn't send that."),
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Support</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Log a request here, or call us on {CONTACT.phone}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-sm bg-primary px-6 py-3.5 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
          aria-expanded={open}
        >
          {open ? "Cancel" : "New request"}
        </button>
      </div>

      {open && (
        <form
          className="mt-8 space-y-6 rounded-sm border border-border p-8"
          onSubmit={(event) => {
            event.preventDefault();
            const fd = new FormData(event.currentTarget);
            create.mutate({
              subject: String(fd.get("subject") ?? ""),
              category: String(fd.get("category") ?? ""),
              description: String(fd.get("description") ?? ""),
            });
          }}
        >
          <div>
            <label htmlFor="subject" className="text-lg font-medium">
              What's happening?
            </label>
            <input id="subject" name="subject" required minLength={3} className={field} />
          </div>
          <div>
            <label htmlFor="category" className="text-lg font-medium">
              Which service?
            </label>
            <select id="category" name="category" className={field} defaultValue="Internet">
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="text-lg font-medium">
              Tell us a bit more
            </label>
            <textarea id="description" name="description" required rows={5} className={field} />
          </div>
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-sm bg-primary px-7 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-deep disabled:opacity-60"
          >
            {create.isPending ? "Sending…" : "Send request"}
          </button>
        </form>
      )}

      {isPending && <p className="mt-8 text-lg text-muted-foreground">Loading…</p>}

      {!isPending && !tickets?.length && (
        <p className="mt-8 text-lg text-muted-foreground">You have no support requests.</p>
      )}

      {!!tickets?.length && (
        <ul className="mt-8 divide-y divide-border rounded-sm border border-border">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">{ticket.subject}</h2>
                <span className="rounded-full bg-secondary px-4 py-1.5 font-medium capitalize">
                  {ticket.status?.replace("_", " ")}
                </span>
              </div>
              <p className="mt-2 text-muted-foreground">
                {ticket.reference} · {ticket.category} ·{" "}
                {new Date(ticket.created_at).toLocaleDateString("en-AU")}
              </p>
              {ticket.description && <p className="mt-4 text-lg">{ticket.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
