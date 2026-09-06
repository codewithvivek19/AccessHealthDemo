import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pill, StatCards } from "@/components/site/PortalShell";

export const Route = createFileRoute("/developer/")({
  component: DeveloperProjects,
});

function DeveloperProjects() {
  const { data, isPending } = useQuery({
    queryKey: ["developer-projects"],
    queryFn: async () => {
      const [projects, milestones] = await Promise.all([
        supabase.from("projects").select("*").order("target_date"),
        supabase.from("project_milestones").select("*").order("sort_order"),
      ]);
      if (projects.error) throw projects.error;
      return { projects: projects.data ?? [], milestones: milestones.data ?? [] };
    },
  });

  if (isPending) return <p className="text-brand-dark/60">Loading…</p>;

  const projects = data?.projects ?? [];

  return (
    <div className="space-y-10">
      <StatCards
        items={[
          { label: "Projects", value: projects.length },
          { label: "On track", value: projects.filter((p) => p.status === "on_track").length },
          { label: "Needs attention", value: projects.filter((p) => p.status !== "on_track").length },
          {
            label: "Average progress",
            value: projects.length
              ? `${Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)}%`
              : "—",
          },
        ]}
      />

      {!projects.length && <p className="text-brand-dark/60">No projects yet.</p>}

      <div className="space-y-8">
        {projects.map((p) => {
          const milestones = (data?.milestones ?? []).filter((m) => m.project_id === p.id);
          return (
            <article key={p.id} className="rounded-2xl border border-brand-dark/10 p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-light tracking-tight text-brand-dark">{p.name}</h2>
                  <p className="mt-1 text-brand-dark/70">{p.summary}</p>
                </div>
                <div className="flex gap-2">
                  <Pill>{p.stage}</Pill>
                  <Pill>{p.status.replace("_", " ")}</Pill>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline justify-between text-sm text-brand-dark/60">
                  <span>{p.progress}% complete</span>
                  {p.target_date && (
                    <span>Target {new Date(p.target_date).toLocaleDateString("en-AU")}</span>
                  )}
                </div>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-dark/10"
                  role="progressbar"
                  aria-valuenow={p.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${p.name} progress`}
                >
                  <div className="h-full bg-brand-green" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {milestones.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-brand-dark">{m.title}</span>
                    <span className="flex items-center gap-3 text-brand-dark/60">
                      {m.due_on && new Date(m.due_on).toLocaleDateString("en-AU")}
                      <Pill>{m.status.replace("_", " ")}</Pill>
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}
