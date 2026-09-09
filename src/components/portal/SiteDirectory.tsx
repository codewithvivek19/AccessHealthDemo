import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DataTable,
  ErrorState,
  RecordHeader,
  SkeletonCard,
  StatusBadge,
} from "@/components/site/PortalShell";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
export function SiteDirectory() {
  const { user } = useAuth();
  const [term, setTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["portal-sites", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from("sites").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
  if (query.isPending) return <SkeletonCard lines={7} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const sites = query.data.filter((s) =>
    [s.name, s.suburb, s.state, s.address]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term.toLowerCase()),
  );
  const selected = query.data.find((s) => s.id === selectedId);
  return (
    <>
      <RecordHeader
        title="Community directory"
        subtitle="Every site. Every service. A connected portfolio."
      />
      <section className="p-panel">
        <div className="p-toolbar">
          <span className="p-directory-count">
            <Building2 size={16} />
            {query.data.length} accessible sites
          </span>
          <label className="p-search-field">
            <Search size={15} />
            <input
              aria-label="Search sites"
              placeholder="Site name or location…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </label>
        </div>
        <DataTable
          data={sites}
          onRowClick={(s) => setSelectedId(s.id)}
          columns={[
            {
              header: "Community",
              sortValue: (s) => s.name,
              accessor: (s) => (
                <span className="p-inline-person">
                  <span className="p-service-icon">
                    <Building2 />
                  </span>
                  <span>
                    {s.name}
                    <span className="p-subtext">{s.address ?? "Address not recorded"}</span>
                  </span>
                </span>
              ),
            },
            {
              header: "Location",
              accessor: (s) => [s.suburb, s.state].filter(Boolean).join(", ") || "Not recorded",
              sortValue: (s) => s.state ?? "",
            },
            { header: "Dwellings", accessor: (s) => s.dwellings, sortValue: (s) => s.dwellings },
            { header: "Services", accessor: (s) => s.services.length },
            { header: "Site stage", accessor: (s) => <StatusBadge status={s.status} /> },
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
                <span className="p-large-avatar">
                  <Building2 size={28} strokeWidth={1.3} />
                </span>
                <span className="p-record-type">COMMUNITY SITE</span>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  {[selected.suburb, selected.state].filter(Boolean).join(", ")}
                </SheetDescription>
              </div>
              <dl className="p-detail-grid">
                <div>
                  <dt>Address</dt>
                  <dd>{selected.address ?? "Not recorded"}</dd>
                </div>
                <div>
                  <dt>Dwellings</dt>
                  <dd>{selected.dwellings}</dd>
                </div>
                <div>
                  <dt>Site stage</dt>
                  <dd>
                    <StatusBadge status={selected.status} />
                  </dd>
                </div>
              </dl>
              <div className="p-sheet-section">
                <h3>Services at this site</h3>
                {selected.services.length ? (
                  selected.services.map((s) => (
                    <div className="p-sheet-record" key={s}>
                      <strong>{s}</strong>
                    </div>
                  ))
                ) : (
                  <p className="p-subtext">No services recorded yet.</p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
