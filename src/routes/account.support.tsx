import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LifeBuoy, Plus, Send, Clock, CheckCircle2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SkeletonCard, EmptyState, RecordHeader, DataTable, StatusBadge } from "@/components/site/PortalShell";

export const Route = createFileRoute("/account/support")({
  component: AccountSupport,
});

function AccountSupport() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [isNew, setIsNew] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
  });

  const { data: tickets, isPending } = useQuery({
    queryKey: ["my-tickets", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("support_tickets").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const current = tickets?.find((t) => t.id === selectedId) ?? null;

  const messages = useQuery({
    queryKey: ["ticket-messages", selectedId],
    enabled: Boolean(selectedId),
    queryFn: async () => {
      const { data, error } = await supabase.from("ticket_messages").select("*").eq("ticket_id", selectedId!).order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const sendReply = useMutation({
    mutationFn: async () => {
      if (!reply.trim() || !selectedId) return;
      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: selectedId, body: reply.trim(), author_name: profile?.full_name ?? "Me", is_from_acsess: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setReply("");
      qc.invalidateQueries({ queryKey: ["ticket-messages", selectedId] });
    },
  });

  if (isPending) return <SkeletonCard lines={6} />;

  return (
    <div className="space-y-6">
      <RecordHeader
        title="Support Requests"
        subtitle="Track your open requests or contact our team"
        icon={<LifeBuoy className="size-5" />}
        actions={
          <button
            onClick={() => setIsNew(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-deep"
          >
            <Plus className="size-4" /> New Request
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
         <div className="lg:col-span-1">
           {tickets?.length === 0 ? (
             <div className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
                <LifeBuoy className="mx-auto size-8 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-900">No support history</p>
                <p className="text-xs text-slate-500 mt-1">You haven't raised any requests yet.</p>
             </div>
           ) : (
             <div className="rounded-lg border border-slate-200 bg-white shadow-sm divide-y divide-slate-100 h-[600px] overflow-y-auto">
               {tickets?.map(t => (
                 <button
                   key={t.id}
                   onClick={() => setSelectedId(t.id)}
                   className={`w-full text-left p-4 transition-colors ${selectedId === t.id ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-slate-50 border-l-2 border-transparent"}`}
                 >
                   <div className="flex justify-between items-start mb-1">
                     <p className="text-xs font-mono text-slate-500">{t.reference}</p>
                     <StatusBadge status={t.status ?? "open"} />
                   </div>
                   <p className="text-sm font-bold text-slate-900 truncate">{t.subject}</p>
                   <p className="text-xs text-slate-500 mt-2">{new Date(t.created_at).toLocaleDateString("en-AU")}</p>
                 </button>
               ))}
             </div>
           )}
         </div>

         <div className="lg:col-span-2 border border-slate-200 bg-white rounded-lg shadow-sm flex flex-col h-[600px] overflow-hidden">
            {!current ? (
               <div className="flex flex-1 items-center justify-center flex-col text-center p-6 text-slate-500">
                  <MessageCircle className="size-10 text-slate-300 mb-4" />
                  <p className="text-sm">Select a request to view details and reply.</p>
               </div>
            ) : (
               <>
                 <div className="border-b border-slate-200 bg-slate-50 p-6">
                    <p className="text-xs font-mono text-slate-500 mb-1">{current.reference}</p>
                    <h3 className="text-lg font-bold text-slate-900">{current.subject}</h3>
                    <div className="mt-4 text-sm text-slate-700 bg-white p-4 rounded border border-slate-200">
                       <span className="font-semibold text-slate-900 block mb-1">Original Request:</span>
                       {current.description}
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                   {messages.data?.map(m => (
                      <div key={m.id} className={`flex flex-col ${!m.is_from_acsess ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[85%] rounded p-3 text-sm shadow-sm ${!m.is_from_acsess ? "bg-primary text-white rounded-tr-none" : "bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200"}`}>
                          {m.body}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                          {m.author_name} · {new Date(m.created_at).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                   ))}
                 </div>

                 {current.status !== "closed" && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                      <form onSubmit={(e) => { e.preventDefault(); if (reply.trim()) sendReply.mutate(); }} className="flex gap-2">
                        <input
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Type a reply..."
                          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <button type="submit" disabled={sendReply.isPending || !reply.trim()} className="flex items-center justify-center rounded bg-primary px-4 text-white hover:bg-primary-deep disabled:opacity-50">
                          <Send className="size-4" />
                        </button>
                      </form>
                    </div>
                 )}
               </>
            )}
         </div>
      </div>
    </div>
  );
}
