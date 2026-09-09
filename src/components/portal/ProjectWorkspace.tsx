import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Check, Circle, Flag, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  EmptyState,
  ErrorState,
  RecordHeader,
  SkeletonCard,
  StatCard,
  StatusBadge,
} from "@/components/site/PortalShell";
import { shortDate } from "@/components/portal/format";
export function ProjectWorkspace() {
  const { user } = useAuth();
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["portal-projects", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [projects, sites, milestones] = await Promise.all([
        supabase.from("projects").select("*").order("target_date"),
        supabase.from("sites").select("id, name, suburb, state"),
        supabase.from("project_milestones").select("*").order("sort_order"),
      ]);
      for (const response of [projects, sites, milestones])
        if (response.error) throw response.error;
      return {
        projects: projects.data ?? [],
        sites: sites.data ?? [],
        milestones: milestones.data ?? [],
      };
    },
  });
  if (query.isPending) return <SkeletonCard lines={7} />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const d = query.data;
  const projects = d.projects.filter(
    (p) =>
      p.name.toLowerCase().includes(term.toLowerCase()) &&
      (filter === "all" || p.status === filter),
  );
  return (
    <>
      <RecordHeader
        title="Projects in perspective"
        subtitle="From the first plan to the final connection."
      />
      <div className="p-stats p-stats-three">
        <StatCard
          label="Projects"
          value={d.projects.length}
          icon={<MapPin />}
          hint="In your accessible portfolio"
        />
        <StatCard
          label="On track"
          value={d.projects.filter((p) => p.status === "on_track").length}
          icon={<Check />}
          hint="Progressing toward delivery"
        />
        <StatCard
          label="Needs attention"
          value={d.projects.filter((p) => p.status === "at_risk" || p.status === "delayed").length}
          icon={<Flag />}
          hint="At risk or delayed"
        />
      </div>
      <section className="p-panel">
        <div className="p-toolbar">
          <div className="p-segments">
            {[
              { value: "all", label: "All projects" },
              { value: "on_track", label: "On track" },
              { value: "at_risk", label: "At risk" },
            ].map((f) => (
              <button
                key={f.value}
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className="p-search-field">
            <Search size={15} />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              aria-label="Search projects"
              placeholder="Find a project…"
            />
          </label>
        </div>
        {projects.length ? (
          projects.map((p) => {
            const site = d.sites.find((s) => s.id === p.site_id);
            const milestones = d.milestones.filter((m) => m.project_id === p.id);
            const progress = Math.max(0, Math.min(100, p.progress));
            return (
              <article className="p-project" key={p.id}>
                <div className="p-project-heading">
                  <div>
                    <p>{site?.name ?? "Site to be confirmed"}</p>
                    <h2>{p.name}</h2>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <p className="p-project-description">{p.summary}</p>
                <div className="p-project-progress">
                  <div>
                    <span className="capitalize">{p.stage.replace(/_/g, " ")}</span>
                    <strong>{progress}%</strong>
                  </div>
                  <progress value={progress} max={100} aria-label={`${p.name} progress`} />
                </div>
                <div className="p-project-footer">
                  <span>
                    <CalendarDays size={14} />
                    Target {shortDate(p.target_date)}
                  </span>
                  <button
                    className="p-text-link"
                    aria-expanded={expanded === p.id}
                    aria-controls={`milestones-${p.id}`}
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  >
                    {expanded === p.id ? "Hide milestones" : `View ${milestones.length} milestones`}
                  </button>
                </div>
                {expanded === p.id && (
                  <div id={`milestones-${p.id}`} className="p-milestones">
                    {milestones.length ? (
                      milestones.map((m) => (
                        <div key={m.id}>
                          <span
                            className={
                              m.status === "complete"
                                ? "p-milestone-complete"
                                : "p-milestone-pending"
                            }
                          >
                            {m.status === "complete" ? <Check size={14} /> : <Circle size={12} />}
                          </span>
                          <div>
                            <strong>{m.title}</strong>
                            <p>{shortDate(m.due_on)}</p>
                          </div>
                          <StatusBadge status={m.status} />
                        </div>
                      ))
                    ) : (
                      <p>No milestones recorded yet.</p>
                    )}
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <EmptyState
            icon={<Flag />}
            title="A clear view ahead."
            description="Projects linked to your organisation will appear here. Try another filter if a project is missing."
          />
        )}
      </section>
    </>
  );
}
