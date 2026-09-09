import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCheck,
  Clock3,
  Inbox,
  LifeBuoy,
  MessageSquare,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  EmptyState,
  ErrorState,
  RecordHeader,
  SkeletonCard,
  StatCard,
  StatusBadge,
} from "@/components/site/PortalShell";

const date = (value: string) =>
  new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
const states = [
  { value: "all", label: "All requests" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

export function SupportWorkspace({
  staff = false,
  initialService = "",
  initialTicket = "",
  openNew = false,
}: {
  staff?: boolean;
  initialService?: string;
  initialTicket?: string;
  openNew?: boolean;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(initialTicket);
  const [newOpen, setNewOpen] = useState(openNew);
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [mobileDetail, setMobileDetail] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const key = ["portal-support", user?.id, staff];
  const query = useQuery({
    queryKey: key,
    enabled: Boolean(user),
    refetchInterval: 10000,
    queryFn: async () => {
      const ticketQuery = supabase
        .from("support_tickets")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(500);
      if (!staff) ticketQuery.eq("user_id", user!.id);
      const profileQuery = supabase
        .from("profiles")
        .select("id, full_name, email, phone, community");
      if (!staff) profileQuery.eq("id", user!.id);
      const [tickets, profiles] = await Promise.all([ticketQuery, profileQuery]);
      if (tickets.error) throw tickets.error;
      if (profiles.error) throw profiles.error;
      return { tickets: tickets.data, profiles: profiles.data };
    },
  });
  const tickets = query.data?.tickets ?? [];
  const selected = tickets.find((t) => t.id === selectedId) ?? null;
  const profile = query.data?.profiles.find((p) => p.id === selected?.user_id);
  const ownProfile = query.data?.profiles.find((p) => p.id === user?.id);
  const visible = tickets.filter(
    (t) =>
      (status === "all" || t.status === status) &&
      `${t.subject} ${t.reference} ${query.data?.profiles.find((p) => p.id === t.user_id)?.full_name ?? ""}`
        .toLowerCase()
        .includes(term.toLowerCase()),
  );
  const messageKey = ["portal-messages", user?.id, selected?.id];
  const messages = useQuery({
    queryKey: messageKey,
    enabled: Boolean(selected && user),
    refetchInterval: 5000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", selected!.id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "instant", block: "nearest" });
  }, [messages.data?.length, selected?.id]);
  useEffect(() => {
    if (initialTicket) {
      setSelectedId(initialTicket);
      setMobileDetail(true);
    }
  }, [initialTicket]);
  useEffect(() => {
    if (openNew) setNewOpen(true);
  }, [openNew, initialService]);

  const send = useMutation({
    mutationFn: async ({ ticketId, body }: { ticketId: string; body: string }) => {
      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: ticketId,
        user_id: user!.id,
        body,
        author_name: staff ? "Acsess Support" : (ownProfile?.full_name ?? "Customer"),
        is_from_acsess: staff,
      });
      if (error) throw error;
      return { ticketId, body };
    },
    onSuccess: ({ ticketId, body }) => {
      setDrafts((current) =>
        current[ticketId]?.trim() === body ? { ...current, [ticketId]: "" } : current,
      );
      void qc.invalidateQueries({ queryKey: ["portal-messages", user?.id, ticketId] });
    },
    onError: () =>
      toast.error("Your message wasn’t sent. Your draft is saved here; please try again."),
  });
  const changeStatus = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: string }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: next })
        .eq("id", id)
        .select("id")
        .single();
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key });
      toast.success("Request status updated.");
    },
    onError: () => toast.error("Couldn’t update the request. Please try again."),
  });
  const create = useMutation({
    mutationFn: async ({
      subject,
      category,
      description,
    }: {
      subject: string;
      category: string;
      description: string;
    }) => {
      if (subject.trim().length < 3 || description.trim().length < 5) {
        throw new Error("Please add a subject and a little more detail.");
      }
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({ user_id: user!.id, subject, category, description })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (ticket) => {
      void qc.invalidateQueries({ queryKey: key });
      setSelectedId(ticket.id);
      setMobileDetail(true);
      setStatus("all");
      setTerm("");
      setNewOpen(false);
      toast.success(`Request ${ticket.reference} created.`);
    },
    onError: () => toast.error("We couldn’t create your request. Please try again."),
  });

  if (query.isPending) return <SkeletonCard lines={8} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const inProgress = tickets.filter((t) => t.status === "in_progress").length;
  const closed = tickets.filter((t) => t.status === "closed").length;
  return (
    <>
      <RecordHeader
        title={staff ? "Service desk" : "A conversation away."}
        subtitle={
          staff
            ? "Every request, with the context to move it forward."
            : "Your questions, updates, and answers. All in one place."
        }
        actions={
          !staff ? (
            <button className="p-button" onClick={() => setNewOpen(true)}>
              <Plus size={16} />
              New request
            </button>
          ) : (
            <span className="p-updating">
              <span />
              Updates every 10 seconds
            </span>
          )
        }
      />
      {staff && (
        <div className="p-stats">
          <StatCard
            label="Requests in this view"
            value={tickets.length}
            icon={<Inbox />}
            hint="Up to 500 recent requests"
          />
          <StatCard
            label="Open"
            value={tickets.filter((t) => t.status === "open").length}
            icon={<MessageSquare />}
            hint="Ready for a first response"
          />
          <StatCard
            label="In progress"
            value={inProgress}
            icon={<Clock3 />}
            hint="Conversations in motion"
          />
          <StatCard
            label="Closed"
            value={closed}
            icon={<CheckCheck />}
            hint="Resolved requests in this view"
          />
        </div>
      )}
      <section className="p-panel p-support-panel">
        <div className="p-toolbar">
          <div className="p-segments" aria-label="Filter request status">
            {states.map((s) => (
              <button
                key={s.value}
                aria-pressed={status === s.value}
                onClick={() => setStatus(s.value)}
              >
                {s.label}
                <span>
                  {s.value === "all"
                    ? tickets.length
                    : tickets.filter((t) => t.status === s.value).length}
                </span>
              </button>
            ))}
          </div>
          <label className="p-search-field">
            <Search size={15} />
            <input
              aria-label="Search requests"
              placeholder="Search requests…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </label>
        </div>
        <div className={`p-inbox ${mobileDetail ? "p-inbox-detail-open" : ""}`}>
          <div className="p-inbox-list">
            <div className="p-inbox-list-label">
              <span>
                {visible.length} REQUEST{visible.length === 1 ? "" : "S"}
              </span>
              <span>Last updated</span>
            </div>
            {visible.length === 0 ? (
              <EmptyState
                icon={<Inbox />}
                title="All clear here."
                description={
                  tickets.length
                    ? "Try another status or search term."
                    : "Your support requests will appear here."
                }
              />
            ) : (
              visible.map((t) => (
                <button
                  key={t.id}
                  className={`p-ticket-preview ${selectedId === t.id ? "is-selected" : ""}`}
                  onClick={() => {
                    setSelectedId(t.id);
                    setMobileDetail(true);
                  }}
                >
                  <div className="p-ticket-meta">
                    <span>{t.reference}</span>
                    <time dateTime={t.updated_at}>{date(t.updated_at)}</time>
                  </div>
                  <strong>{t.subject}</strong>
                  <p>{t.description}</p>
                  <div className="p-ticket-bottom">
                    <StatusBadge status={t.status} />
                    <span>
                      {staff
                        ? (query.data.profiles.find((p) => p.id === t.user_id)?.full_name ??
                          "Customer")
                        : t.category.replace(/_/g, " ")}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-conversation">
            {!selected ? (
              <div className="p-conversation-welcome">
                <div className="p-conversation-art">
                  <MessageSquare size={39} strokeWidth={1} />
                  <span>
                    <Check size={15} />
                  </span>
                </div>
                <h2>{staff ? "Good service starts here." : "We’re here to help."}</h2>
                <p>
                  {staff
                    ? "Choose a request to see the conversation and customer details."
                    : "Open a request to continue your conversation with Acsess."}
                </p>
                {!staff && (
                  <button className="p-button p-button-secondary" onClick={() => setNewOpen(true)}>
                    Start a request
                    <ArrowUpRight size={15} />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="p-conversation-header">
                  <button
                    className="p-icon-button p-conversation-back"
                    aria-label="Back to requests"
                    onClick={() => setMobileDetail(false)}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <div className="p-conversation-reference">
                      {selected.reference}
                      <span>·</span>
                      {selected.category.replace(/_/g, " ")}
                    </div>
                    <h2>{selected.subject}</h2>
                  </div>
                  {staff ? (
                    <select
                      className="p-status-select"
                      aria-label="Request status"
                      value={selected.status}
                      disabled={changeStatus.isPending}
                      onChange={(e) =>
                        changeStatus.mutate({ id: selected.id, next: e.target.value })
                      }
                    >
                      {states
                        .filter((s) => s.value !== "all")
                        .map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <StatusBadge status={selected.status} />
                  )}
                </div>
                {staff && (
                  <div className="p-conversation-customer">
                    <span className="p-customer-avatar">
                      {(profile?.full_name ?? "C").charAt(0)}
                    </span>
                    <div>
                      <strong>{profile?.full_name ?? "Customer"}</strong>
                      <span>{profile?.email ?? "No email recorded"}</span>
                    </div>
                    <div className="p-customer-location">
                      {profile?.community ?? "Community not recorded"}
                    </div>
                  </div>
                )}
                <div className="p-message-scroll" aria-label="Conversation">
                  <div className="p-conversation-date">
                    Opened{" "}
                    {new Date(selected.created_at).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="p-original-request">
                    <span>Original request</span>
                    <p>{selected.description}</p>
                  </div>
                  {messages.isError ? (
                    <ErrorState retry={() => void messages.refetch()} />
                  ) : messages.isPending ? (
                    <p className="p-message-loading">Loading conversation…</p>
                  ) : (
                    messages.data.map((m) => (
                      <div
                        key={m.id}
                        className={`p-message ${m.is_from_acsess === staff ? "p-message-own" : ""}`}
                      >
                        <div className="p-message-author">
                          {m.is_from_acsess ? "Acsess Support" : m.author_name}
                        </div>
                        <div className="p-message-body">{m.body}</div>
                        <time dateTime={m.created_at}>
                          {new Date(m.created_at).toLocaleString("en-AU", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                    ))
                  )}
                  <div ref={endRef} />
                </div>
                {selected.status === "closed" ? (
                  <div className="p-closed-message">
                    <CheckCheck size={18} />
                    <div>
                      <strong>This request is closed.</strong>
                      <p>
                        {staff
                          ? "Change the status to continue this conversation."
                          : "Need more help? Start a new request and include this reference."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form
                    className="p-composer"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const body = drafts[selected.id]?.trim();
                      if (body) send.mutate({ ticketId: selected.id, body });
                    }}
                  >
                    <label className="sr-only" htmlFor="support-message">
                      Your reply
                    </label>
                    <textarea
                      id="support-message"
                      rows={3}
                      maxLength={4000}
                      placeholder={staff ? "Write a reply to the customer…" : "Write your message…"}
                      value={drafts[selected.id] ?? ""}
                      onChange={(e) =>
                        setDrafts((current) => ({ ...current, [selected.id]: e.target.value }))
                      }
                    />
                    <div>
                      <span>
                        <MessageSquare size={12} />
                        {staff ? "Visible to the customer" : "Messages refresh automatically"}
                      </span>
                      <button
                        type="submit"
                        className="p-button"
                        disabled={send.isPending || !drafts[selected.id]?.trim()}
                      >
                        {send.isPending ? "Sending…" : "Send reply"}
                        <Send size={14} />
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </section>
      {!staff && (
        <p className="p-support-footnote">
          Prefer to talk? <a href="tel:1300736785">1300 736 785</a>
          <span>Monday to Friday, business hours (AEST)</span>
        </p>
      )}
      <Dialog
        open={newOpen}
        onOpenChange={(open) => {
          if (!create.isPending) setNewOpen(open);
        }}
      >
        <DialogContent className="portal-popup p-request-dialog">
          <DialogTitle>How can we help?</DialogTitle>
          <DialogDescription>
            Tell us what’s happening. We’ll keep you updated in your support conversation.
          </DialogDescription>
          <form
            className="p-form"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              create.mutate({
                subject: String(fd.get("subject")).trim(),
                category: String(fd.get("category")),
                description: String(fd.get("description")).trim(),
              });
            }}
          >
            <label className="p-field">
              Subject
              <input
                name="subject"
                className="p-input"
                required
                minLength={3}
                maxLength={160}
                defaultValue={initialService ? `Help with ${initialService}` : ""}
                placeholder="A short description of the issue"
              />
            </label>
            <label className="p-field">
              What is this about?
              <select name="category" className="p-input" defaultValue="general">
                <option value="general">General support</option>
                <option value="internet">Internet & Wi-Fi</option>
                <option value="telephone">Telephone</option>
                <option value="television">Television</option>
                <option value="billing">Plans & billing</option>
                <option value="safety">Safety products</option>
              </select>
            </label>
            <label className="p-field">
              A little more detail
              <textarea
                name="description"
                className="p-input"
                rows={5}
                required
                minLength={5}
                maxLength={4000}
                placeholder="What happened, and when did it start?"
              />
            </label>
            <div className="p-form-actions">
              <button
                type="button"
                className="p-button p-button-secondary"
                onClick={() => setNewOpen(false)}
                disabled={create.isPending}
              >
                Cancel
              </button>
              <button className="p-button" type="submit" disabled={create.isPending}>
                {create.isPending ? "Creating…" : "Create request"}
                <ArrowUpRight size={15} />
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
