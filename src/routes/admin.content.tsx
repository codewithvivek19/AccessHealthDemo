import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

type Kind = "services" | "resources" | "products";

const SECTIONS: { table: Kind; heading: string; blurb: string }[] = [
  { table: "services", heading: "Services", blurb: "What appears on the services pages." },
  { table: "resources", heading: "Resources and news", blurb: "Guides, datasheets and articles." },
  { table: "products", heading: "Products", blurb: "Product pages such as SWITCH STAR." },
];

function AdminContent() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-brand-dark">Website content</h1>
        <p className="mt-2 text-lg text-brand-dark/70">
          Show or hide anything on the public website without changing the design.
        </p>
      </div>
      {SECTIONS.map((section) => (
        <ContentSection key={section.table} {...section} />
      ))}
    </div>
  );
}

function ContentSection({ table, heading, blurb }: { table: Kind; heading: string; blurb: string }) {
  const qc = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["admin-content", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("id, slug, is_published")
        .order("slug");
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
      <h2 className="text-2xl font-light tracking-tight text-brand-dark">{heading}</h2>
      <p className="mt-1 text-brand-dark/70">{blurb}</p>

      {isPending && <p className="mt-4 text-brand-dark/60">Loading…</p>}

      <ul className="mt-5 divide-y divide-brand-dark/10 rounded-2xl border border-brand-dark/10">
        {data?.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <span className="text-brand-dark">{row.slug.replace(/-/g, " ")}</span>
            <button
              type="button"
              aria-pressed={row.is_published}
              onClick={() => toggle.mutate({ id: row.id, next: !row.is_published })}
              className={`rounded-full px-5 py-2 text-sm tracking-wide uppercase ${
                row.is_published
                  ? "bg-brand-green text-white"
                  : "border border-brand-dark/15 text-brand-dark/60 hover:bg-brand-dark/5"
              }`}
            >
              {row.is_published ? "Published" : "Hidden"}
            </button>
          </li>
        ))}
        {data && !data.length && <li className="p-5 text-brand-dark/60">Nothing here yet.</li>}
      </ul>
    </section>
  );
}
