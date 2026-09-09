import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Inbox, Mail, Phone, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DataTable, ErrorState, RecordHeader, SkeletonCard } from "@/components/site/PortalShell";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { initials, shortDate } from "@/components/portal/format";
export const Route = createFileRoute("/staff/enquiries")({ component: StaffEnquiries });
function StaffEnquiries() {
  const { user } = useAuth();
  const [term, setTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["portal-enquiries", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });
  if (query.isPending) return <SkeletonCard lines={6} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const rows = query.data.filter((e) =>
    [e.name, e.email, e.topic, e.organisation, e.message]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term.toLowerCase()),
  );
  const selected = query.data.find((e) => e.id === selectedId);
  return (
    <>
      <RecordHeader
        title="Website enquiries"
        subtitle="The beginning of a new connection."
        actions={
          <span className="p-directory-count">
            <Inbox size={16} />
            {query.data.length} recent enquiries
          </span>
        }
      />
      <section className="p-panel">
        <div className="p-toolbar">
          <span className="p-directory-count">Latest messages from the website</span>
          <label className="p-search-field">
            <Search size={15} />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search enquiries…"
              aria-label="Search enquiries"
            />
          </label>
        </div>
        <DataTable
          data={rows}
          onRowClick={(e) => setSelectedId(e.id)}
          columns={[
            {
              header: "From",
              sortValue: (e) => e.name,
              accessor: (e) => (
                <span className="p-inline-person">
                  <span className="p-customer-avatar">{initials(e.name)}</span>
                  <span>
                    {e.name}
                    <span className="p-subtext">{e.email}</span>
                  </span>
                </span>
              ),
            },
            { header: "Organisation", accessor: (e) => e.organisation ?? "Individual enquiry" },
            {
              header: "Topic",
              accessor: (e) => <span className="capitalize">{e.topic ?? "General"}</span>,
            },
            {
              header: "Received",
              sortValue: (e) => e.created_at,
              accessor: (e) => shortDate(e.created_at),
            },
            { header: "", accessor: () => <ArrowUpRight size={15} /> },
          ]}
        />
      </section>
      <Sheet
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <SheetContent className="portal-popup p-record-sheet">
          {selected && (
            <>
              <div className="p-profile-cover">
                <span className="p-record-type">WEBSITE ENQUIRY</span>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{selected.organisation ?? selected.email}</SheetDescription>
                <div className="p-profile-actions">
                  <a
                    className="p-button"
                    href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: Your Acsess Health enquiry")}`}
                  >
                    <Mail size={15} />
                    Reply by email
                  </a>
                  {selected.phone && (
                    <a className="p-button p-button-secondary" href={`tel:${selected.phone}`}>
                      <Phone size={15} />
                      Call
                    </a>
                  )}
                </div>
              </div>
              <dl className="p-detail-grid">
                <div>
                  <dt>Received</dt>
                  <dd>{shortDate(selected.created_at)}</dd>
                </div>
                <div>
                  <dt>Topic</dt>
                  <dd>{selected.topic ?? "General"}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{selected.email}</dd>
                </div>
                <div>
                  <dt>Audience</dt>
                  <dd>{selected.audience ?? "Not specified"}</dd>
                </div>
              </dl>
              <div className="p-sheet-section">
                <h3>Message</h3>
                <p className="p-enquiry-message">{selected.message}</p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
