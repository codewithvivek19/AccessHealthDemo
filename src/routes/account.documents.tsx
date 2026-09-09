import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState, SkeletonCard, RecordHeader, DataTable } from "@/components/site/PortalShell";

export const Route = createFileRoute("/account/documents")({
  component: Documents,
});

function Documents() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");

  const { data, isPending } = useQuery({
    queryKey: ["my-documents", user?.id],
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

  const categories = ["all", ...Array.from(new Set((data ?? []).map((d) => d.category).filter(Boolean)))];
  const filtered = filter === "all" ? (data ?? []) : (data ?? []).filter((d) => d.category === filter);

  if (isPending) return <SkeletonCard lines={4} />;

  return (
    <div className="space-y-6">
      <RecordHeader
        title="Documents"
        subtitle="Service agreements, statements and setup guides"
        icon={<FileText className="size-5" />}
        actions={
          categories.length > 1 && (
            <div className="flex bg-slate-100 p-1 rounded-md">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                    filter === cat ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )
        }
      />

      {!filtered.length ? (
        <EmptyState icon={<FileText className="size-7" />} title="No documents" description="Invoices, agreements and guides will appear here." />
      ) : (
        <DataTable
          data={filtered}
          columns={[
            {
              header: "Document Title",
              className: "w-full",
              accessor: (r) => (
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded bg-slate-100 text-slate-500">
                    <FileCheck className="size-4" />
                  </div>
                  <span className="font-medium text-slate-900">{r.title}</span>
                </div>
              )
            },
            {
              header: "Category",
              accessor: (r) => <span className="capitalize text-slate-600">{r.category ?? "General"}</span>
            },
            {
              header: "Size",
              accessor: (r) => <span className="text-slate-600">{r.size_label ?? "-"}</span>
            },
            {
              header: "Date",
              accessor: (r) => <span className="text-slate-600">{r.issued_on ? new Date(r.issued_on).toLocaleDateString("en-AU") : "-"}</span>
            },
            {
              header: "",
              accessor: (r) => r.file_url ? (
                <a href={r.file_url} download className="flex items-center justify-center rounded border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors">
                  <Download className="size-4" />
                </a>
              ) : null
            }
          ]}
        />
      )}
    </div>
  );
}
