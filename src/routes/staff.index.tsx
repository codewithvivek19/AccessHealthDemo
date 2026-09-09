import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Clock, CheckCircle2, MessageCircle, Send, LayoutDashboard, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge, SkeletonCard, EmptyState, RecordHeader, DataTable, StatCard } from "@/components/site/PortalShell";

export const Route = createFileRoute("/staff/")({
  component: StaffQueue,
});

const STATUSES = ["open", "in_progress", "closed"] as const;

function ticketIcon(status: string) {
  if (status === "open") return <AlertCircle className="size-4 text-blue-500" aria-hidden />;
  if (status === "in_progress") return <Clock className="size-4 text-amber-500" aria-hidden />;
  if (status === "closed") return <CheckCircle2 className="size-4 text-emerald-500" aria-hidden />;
  return <Clock className="size-4 text-slate-400" aria-hidden />;
}

function priorityBadge(p: string) {
  if (p === "urgent") return "text-red-700 bg-red-100 border-red-200";
  if (p === "high") return "text-orange-700 bg-orange-100 border-orange-200";
  return "text-slate-600 bg-slate-100 border-slate-200";
}

function StaffQueue() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("open");

  const { data, isPending } = useQuery({
    queryKey: ["staff-queue"],
    queryFn: async () => {
      const [tickets, profiles] = await Promise.all([
        supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name, email, phone, community"),
      ]);
      if (tickets.error) throw tickets.error;
      return { tickets: tickets.data ?? [], profiles: profiles.data ?? [] };
    },
  });

  const current = data?.tickets.find((t) => t.id === selectedId) ?? null;
  const customer = current ? data?.profiles.find((p) => p.id === current.user_id) : null;

  const messages = useQuery({
    queryKey: ["staff-messages", selectedId],
    enabled: Boolean(selectedId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_messages").select("*").eq("ticket_id", selectedId!).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("support_tickets").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff-queue"] }),
  });

  const sendReply = useMutation({
    mutationFn: async () => {
      if (!reply.trim() || !selectedId) return;
      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: selectedId, body: reply.trim(), author_name: "Acsess Support", is_from_acsess: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setReply("");
      qc.invalidateQueries({ queryKey: ["staff-messages", selectedId] });
    },
  });

  const all = data?.tickets ?? [];
  const stats = {
    open: all.filter((t) => t.status === "open").length,
    inProgress: all.filter((t) => t.status === "in_progress").length,
    closed: all.filter((t) => t.status === "closed").length,
    urgent: all.filter((t) => t.priority === "urgent" && t.status !== "closed").length,
  };

  const visible = all.filter((t) => filterStatus === "all" ? true : t.status === filterStatus);

  if (isPending) return <div className="grid gap-4 sm:grid-cols-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-6">
      <RecordHeader
        title="Support Queue"
        subtitle="Manage and respond to customer requests"
        icon={<LayoutDashboard className="size-5" />}
        actions={
          <div className="flex bg-slate-100 p-1 rounded-md">
            {[["all", "All"], ["open", "Open"], ["in_progress", "In Progress"], ["closed", "Closed"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterStatus(String(val))}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  filterStatus === val ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Tickets" value={stats.open} icon={<AlertCircle className="size-5" />} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatCard label="In Progress" value={stats.inProgress} icon={<Clock className="size-5" />} iconBg="bg-amber-100" iconColor="text-amber-600" />
        <StatCard label="Closed Today" value={stats.closed} icon={<CheckCircle2 className="size-5" />} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <StatCard label="Urgent" value={stats.urgent} icon={<AlertCircle className="size-5" />} iconBg="bg-red-100" iconColor="text-red-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {/* Table View */}
        <div className="lg:col-span-2 xl:col-span-3">
          <DataTable
            data={visible}
            onRowClick={(row) => setSelectedId(row.id === selectedId ? null : row.id)}
            columns={[
              {
                header: "Reference",
                accessor: (r) => <span className="font-mono text-xs">{r.reference}</span>
              },
              {
                header: "Subject",
                className: "w-full",
                accessor: (r) => (
                  <div className="flex items-center gap-2">
                    {ticketIcon(r.status ?? "open")}
                    <span className="font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs">{r.subject}</span>
                  </div>
                )
              },
              {
                header: "Customer",
                accessor: (r) => {
                  const p = data?.profiles.find(p => p.id === r.user_id);
                  return p?.full_name ?? p?.email ?? "Unknown";
                }
              },
              {
                header: "Priority",
                accessor: (r) => (
                  <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${priorityBadge(r.priority ?? "normal")}`}>
                    {r.priority ?? "normal"}
                  </span>
                )
              },
              {
                header: "Status",
                accessor: (r) => <StatusBadge status={r.status ?? "open"} />
              },
              {
                header: "Opened",
                accessor: (r) => new Date(r.created_at).toLocaleDateString("en-AU")
              }
            ]}
          />
        </div>

        {/* Record Detail View (Salesforce Split View Style) */}
        <div className="lg:col-span-1 border border-slate-200 bg-white rounded-lg shadow-sm flex flex-col h-[600px] overflow-hidden sticky top-20">
          {!current ? (
            <div className="flex flex-1 items-center justify-center flex-col text-center p-6 text-slate-500">
              <MessageCircle className="size-10 text-slate-300 mb-4" />
              <p className="text-sm">Select a ticket to view details and respond.</p>
            </div>
          ) : (
            <>
              {/* Record Detail Header */}
              <div className="border-b border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-mono text-slate-500">{current.reference}</p>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{current.subject}</h3>
                  </div>
                  <StatusBadge status={current.status ?? "open"} />
                </div>
                {customer && (
                  <div className="bg-white border border-slate-200 rounded p-3 text-xs mb-3">
                    <p className="font-semibold text-slate-900">{customer.full_name ?? "Unnamed Customer"}</p>
                    <p className="text-slate-500 mt-0.5">{customer.email}</p>
                    {customer.phone && <p className="text-slate-500">{customer.phone}</p>}
                  </div>
                )}
                <div className="flex gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus.mutate({ id: current.id, status: s })}
                      className={`flex-1 rounded border py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                        current.status === s ? "bg-primary border-primary text-white" : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed/Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="font-semibold text-slate-900 block mb-1">Description:</span>
                  {current.description}
                </div>
                {messages.data?.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.is_from_acsess ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[85%] rounded p-3 text-sm shadow-sm ${m.is_from_acsess ? "bg-primary text-white rounded-tr-none" : "bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200"}`}>
                      {m.body}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {m.author_name} · {new Date(m.created_at).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="p-3 bg-slate-50 border-t border-slate-200">
                <form onSubmit={(e) => { e.preventDefault(); if (reply.trim()) sendReply.mutate(); }} className="flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button type="submit" disabled={sendReply.isPending || !reply.trim()} className="flex items-center justify-center rounded bg-primary px-3 text-white hover:bg-primary-deep disabled:opacity-50">
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
