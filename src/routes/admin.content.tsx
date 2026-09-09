import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, FileText, Globe, Package, Radio } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  RecordHeader,
  SkeletonCard,
  DataTable,
  ErrorState,
  StatusBadge,
} from "@/components/site/PortalShell";
import { Switch } from "@/components/ui/switch";
export const Route = createFileRoute("/admin/content")({ component: AdminContent });
type Kind = "services" | "resources" | "products";
const sections: { table: Kind; heading: string; blurb: string }[] = [
  {
    table: "services",
    heading: "Service catalogue",
    blurb: "The services your communities can discover.",
  },
  {
    table: "resources",
    heading: "Resources & news",
    blurb: "Helpful information, shared with your audience.",
  },
  { table: "products", heading: "Products", blurb: "Your product pages, including SWITCH STAR." },
];
function AdminContent() {
  return (
    <>
      <RecordHeader
        title="Website content"
        subtitle="What your customers see, thoughtfully managed."
        actions={
          <a className="p-button p-button-secondary" href="/" target="_blank" rel="noreferrer">
            <Globe size={15} />
            View website
            <ArrowUpRight size={14} />
          </a>
        }
      />
      <div className="p-stack">
        {sections.map((section) => (
          <ContentSection key={section.table} {...section} />
        ))}
      </div>
    </>
  );
}
function ContentSection({
  table,
  heading,
  blurb,
}: {
  table: Kind;
  heading: string;
  blurb: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["portal-content", user?.id, table];
  const query = useQuery({
    queryKey: key,
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("id, slug, is_published")
        .order("slug");
      if (error) throw error;
      return data;
    },
  });
  const toggle = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }) => {
      const { error } = await supabase
        .from(table)
        .update({ is_published: next })
        .eq("id", id)
        .select("id")
        .single();
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: [table] });
      toast.success("Visibility updated.");
    },
    onError: () =>
      toast.error(
        "Visibility couldn’t be updated. Your account may not have permission to publish.",
      ),
  });
  return (
    <section className="p-panel">
      <div className="p-panel-heading">
        <div>
          <h2>{heading}</h2>
          <p>{blurb}</p>
        </div>
        {table === "services" ? (
          <Radio size={18} className="text-slate-400" />
        ) : table === "products" ? (
          <Package size={18} className="text-slate-400" />
        ) : (
          <FileText size={18} className="text-slate-400" />
        )}
      </div>
      {query.isPending ? (
        <SkeletonCard />
      ) : query.isError ? (
        <ErrorState retry={() => void query.refetch()} />
      ) : (
        <DataTable
          data={query.data}
          columns={[
            {
              header: "Page",
              sortValue: (r) => r.slug,
              accessor: (r) => <span className="capitalize">{r.slug.replace(/-/g, " ")}</span>,
            },
            {
              header: "Visibility",
              accessor: (r) => <StatusBadge status={r.is_published ? "live" : "hidden"} />,
            },
            {
              header: "Published",
              accessor: (r) => (
                <Switch
                  className="p-preference-switch"
                  checked={r.is_published}
                  disabled={toggle.isPending}
                  aria-label={`Publish ${r.slug}`}
                  onCheckedChange={(next) => toggle.mutate({ id: r.id, next })}
                />
              ),
            },
          ]}
        />
      )}
    </section>
  );
}
