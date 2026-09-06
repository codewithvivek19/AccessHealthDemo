import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Pill, StatCards } from "@/components/site/PortalShell";

export const Route = createFileRoute("/staff/")({
  component: StaffQueue,
});

const STATUSES = ["open", "in_progress", "waiting", "closed"] as const;

function StaffQueue() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [reply, setReply] = useState("");

  const tickets = useQuery({
    queryKey: ["staff-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const messages = useQuery({
    queryKey: ["staff-ticket-messages", selected],
    enabled: Boolean(selected),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", selected!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const sendReply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: selected!,
        user_id: user!.id,
        author_name: "Acsess support",
        is_from_acsess: true,
        body: reply.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setReply("");
      qc.invalidateQueries({ queryKey: ["staff-ticket-messages", selected] });
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("support_tickets").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-tickets"] }),
  });

  const all = tickets.data ?? [];
  const list = filter === "all" ? all : all.filter((t) => t.status === filter);
  const current = all.find((t) => t.id === selected) ?? null;

  return (
    <div className="space-y-10">
      <StatCards
        items={[
          { label: "All requests", value: all.length },
          { label: "Open", value: all.filter((t) => t.status === "open").length },
          { label: "In progress", value: all.filter((t) => t.status === "in_progress").length },
          {
            label: "Urgent",
            value: all.filter((t) => t.priority === "urgent" && t.status !== "closed").length,
          },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-sm tracking-wide uppercase ${
              filter === s
                ? "bg-brand-green text-white"
                : "border border-brand-dark/15 text-brand-dark/70 hover:bg-brand-dark/5"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-2xl border border-brand-dark/10">
          {tickets.isPending && <p className="p-6 text-brand-dark/60">Loading requests…</p>}
          {!tickets.isPending && !list.length && (
            <p className="p-6 text-brand-dark/60">Nothing in this view.</p>
          )}
          <ul className="divide-y divide-brand-dark/10">
            {list.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setSelected(t.id)}
                  className={`w-full px-6 py-5 text-left hover:bg-brand-dark/5 ${
                    selected === t.id ? "bg-brand-dark/5" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium text-brand-dark">{t.subject}</p>
                    <Pill>{t.status.replace("_", " ")}</Pill>
                  </div>
                  <p className="mt-1 text-sm text-brand-dark/60">
                    {t.reference} · {t.category} · {t.priority} ·{" "}
                    {new Date(t.created_at).toLocaleDateString("en-AU")}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-brand-dark/10 p-6">
          {!current && <p className="text-brand-dark/60">Select a request to see the detail.</p>}
          {current && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-light tracking-tight text-brand-dark">
                  {current.subject}
                </h2>
                <p className="mt-1 text-sm text-brand-dark/60">
                  {current.reference} · raised{" "}
                  {new Date(current.created_at).toLocaleDateString("en-AU")}
                </p>
                <p className="mt-4 whitespace-pre-wrap text-brand-dark/80">
                  {current.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus.mutate({ id: current.id, status: s })}
                    className={`rounded-full px-4 py-2 text-sm tracking-wide uppercase ${
                      current.status === s
                        ? "bg-brand-dark text-white"
                        : "border border-brand-dark/15 text-brand-dark/70 hover:bg-brand-dark/5"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {messages.data?.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-2xl p-4 ${
                      m.is_from_acsess ? "bg-brand-green/10" : "bg-brand-dark/5"
                    }`}
                  >
                    <p className="text-sm text-brand-dark/60">
                      {m.author_name} · {new Date(m.created_at).toLocaleString("en-AU")}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-brand-dark/85">{m.body}</p>
                  </div>
                ))}
                {messages.data && !messages.data.length && (
                  <p className="text-brand-dark/60">No replies yet.</p>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (reply.trim()) sendReply.mutate();
                }}
                className="space-y-3"
              >
                <label htmlFor="reply" className="block text-sm tracking-wide uppercase text-brand-dark/60">
                  Reply to the customer
                </label>
                <textarea
                  id="reply"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-brand-dark/15 p-4 text-brand-dark focus:border-brand-green focus:outline-none"
                  placeholder="Type your reply…"
                />
                <button
                  type="submit"
                  disabled={sendReply.isPending || !reply.trim()}
                  className="inline-flex items-center rounded-full bg-brand-dark px-6 py-3 text-sm tracking-wide text-white uppercase hover:bg-brand-green disabled:opacity-50"
                >
                  {sendReply.isPending ? "Sending…" : "Send reply"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
