import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, FileText, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DataTable,
  EmptyState,
  ErrorState,
  RecordHeader,
  SkeletonCard,
} from "@/components/site/PortalShell";
import { shortDate } from "@/components/portal/format";
export const Route = createFileRoute("/account/documents")({ component: Documents });
function Documents() {
  const { user } = useAuth();
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const query = useQuery({
    queryKey: ["portal-documents", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user!.id)
        .order("issued_on", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (query.isPending) return <SkeletonCard lines={6} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const docs = query.data.filter(
    (d) =>
      (category === "all" || d.category === category) &&
      d.title.toLowerCase().includes(term.toLowerCase()),
  );
  return (
    <>
      <RecordHeader title="Your document library." subtitle="The important things, all together." />
      <section className="p-panel">
        <div className="p-toolbar">
          <div className="p-segments">
            {["all", ...new Set(query.data.map((d) => d.category))].map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className="capitalize"
              >
                {c === "all" ? "All documents" : c}
              </button>
            ))}
          </div>
          <label className="p-search-field">
            <Search size={15} />
            <input
              aria-label="Search documents"
              placeholder="Find a document…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </label>
        </div>
        {query.data.length ? (
          <DataTable
            data={docs}
            columns={[
              {
                header: "Document",
                sortValue: (d) => d.title,
                accessor: (d) => (
                  <span className="p-inline-person">
                    <span className="p-service-icon">
                      <FileText />
                    </span>
                    <span>
                      {d.title}
                      <span className="p-subtext capitalize">{d.category}</span>
                    </span>
                  </span>
                ),
              },
              {
                header: "Issued",
                sortValue: (d) => d.issued_on,
                accessor: (d) => shortDate(d.issued_on),
              },
              { header: "Size", accessor: (d) => d.size_label ?? "—" },
              {
                header: "",
                accessor: (d) =>
                  d.file_url && /^https?:\/\//i.test(d.file_url) ? (
                    <a
                      href={d.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-button p-button-secondary"
                      aria-label={`Open ${d.title}`}
                    >
                      <ArrowDownToLine size={15} />
                      Open
                    </a>
                  ) : (
                    <span className="p-subtext">File pending</span>
                  ),
              },
            ]}
          />
        ) : (
          <EmptyState
            icon={<FileText />}
            title="A place for the essentials."
            description="Your service agreements, invoices, and shared guides will appear here."
          />
        )}
      </section>
      <p className="p-support-footnote">
        Looking for something specific? <a href="tel:1300736785">Our team can help.</a>
      </p>
    </>
  );
}
