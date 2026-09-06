import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/staff/enquiries")({
  component: StaffEnquiries,
});

function StaffEnquiries() {
  const { data, isPending } = useQuery({
    queryKey: ["staff-enquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-light tracking-tight text-brand-dark">Website enquiries</h1>
      <p className="mt-2 text-lg text-brand-dark/70">
        Messages sent through the contact and support forms.
      </p>

      {isPending && <p className="mt-8 text-brand-dark/60">Loading…</p>}
      {!isPending && !data?.length && <p className="mt-8 text-brand-dark/60">No enquiries yet.</p>}

      <ul className="mt-8 space-y-4">
        {data?.map((e) => (
          <li key={e.id} className="rounded-2xl border border-brand-dark/10 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-lg font-medium text-brand-dark">{e.name}</p>
              <p className="text-sm text-brand-dark/60">
                {new Date(e.created_at).toLocaleString("en-AU")}
              </p>
            </div>
            <p className="mt-1 text-brand-dark/70">
              {[e.email, e.phone, e.organisation, e.audience, e.topic].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-brand-dark/85">{e.message}</p>
            <a
              href={`mailto:${e.email}`}
              className="mt-4 inline-flex rounded-full border border-brand-dark/20 px-5 py-2.5 text-sm tracking-wide text-brand-dark uppercase hover:bg-brand-dark/5"
            >
              Reply by email
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
