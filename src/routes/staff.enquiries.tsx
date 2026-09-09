import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Clock, Building2, InboxIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState, SkeletonCard, PageHeader } from "@/components/site/PortalShell";

export const Route = createFileRoute("/staff/enquiries")({
  component: StaffEnquiries,
});

function StaffEnquiries() {
  const { data, isPending } = useQuery({
    queryKey: ["staff-enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isPending) return <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonCard key={i} lines={3} />)}</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Website enquiries" subtitle="Messages sent through the contact and support forms." />
      {!data?.length ? (
        <EmptyState icon={<InboxIcon className="size-7" />} title="No enquiries yet" description="Messages from the website contact form will appear here." />
      ) : (
        <div className="space-y-4">
          {data.map((e) => (
            <article key={e.id} className="rounded-xl border border-border bg-background p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary uppercase">
                    {e.name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{e.name}</p>
                    {e.organisation && <p className="flex items-center gap-1 text-xs text-muted-foreground"><Building2 className="size-3" />{e.organisation}</p>}
                  </div>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" />{new Date(e.created_at).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {e.email && <span className="flex items-center gap-1"><Mail className="size-3.5" />{e.email}</span>}
                {e.phone && <span className="flex items-center gap-1"><Phone className="size-3.5" />{e.phone}</span>}
                {e.topic && <span className="rounded bg-secondary px-2 py-0.5 capitalize">{e.topic}</span>}
                {e.audience && <span className="rounded bg-secondary px-2 py-0.5 capitalize">{e.audience}</span>}
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm text-foreground/85">{e.message}</p>
              {e.email && (
                <a
                  href={`mailto:${e.email}?subject=Re: Your Acsess Health enquiry`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <Mail className="size-3.5" aria-hidden />
                  Reply by email
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
