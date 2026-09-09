import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RecordHeader, SkeletonCard, DataTable } from "@/components/site/PortalShell";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

type Kind = "services" | "resources" | "products";
const SECTIONS: { table: Kind; heading: string; blurb: string }[] = [
  { table: "services", heading: "Services", blurb: "Pages in the services directory" },
  { table: "resources", heading: "Resources & News", blurb: "Guides, FAQs and articles" },
  { table: "products", heading: "Products", blurb: "Standalone products like Switch Star" },
];

function AdminContent() {
  return (
    <div className="space-y-8">
      <RecordHeader
        title="Public Content"
        subtitle="Manage visibility of pages on the public website"
        icon={<Globe className="size-5" />}
      />
      {SECTIONS.map((s) => <ContentSection key={s.table} {...s} />)}
    </div>
  );
}

function ContentSection({ table, heading, blurb }: { table: Kind; heading: string; blurb: string }) {
  const qc = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["admin-content", table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("id, slug, is_published").order("slug");
      if (error) throw error;
      return data as { id: string; slug: string; is_published: boolean }[];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }) => {
      const { error } = await supabase.from(table).update({ is_published: next }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-content", table] }),
  });

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-base font-bold text-slate-900">{heading}</h2>
        <p className="text-xs text-slate-500">{blurb}</p>
      </div>
      {isPending && <SkeletonCard lines={2} />}
      {!isPending && data && (
        <DataTable
          data={data}
          columns={[
            {
              header: "Page Slug",
              className: "w-full",
              accessor: (r) => <span className="font-semibold text-slate-900 capitalize">{r.slug.replace(/-/g, " ")}</span>
            },
            {
              header: "Status",
              accessor: (r) => (
                <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${r.is_published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                  {r.is_published ? "Published" : "Hidden"}
                </span>
              )
            },
            {
              header: "Visibility Toggle",
              accessor: (r) => (
                <button
                  type="button"
                  onClick={() => toggle.mutate({ id: r.id, next: !r.is_published })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${r.is_published ? "bg-primary" : "bg-slate-300"}`}
                >
                  <span className={`inline-block size-3 rounded-full bg-white transition-transform ${r.is_published ? "translate-x-5" : "translate-x-1"}`} />
                </button>
              )
            }
          ]}
        />
      )}
    </section>
  );
}
