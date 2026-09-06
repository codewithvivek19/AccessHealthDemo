import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/account/documents")({
  component: Documents,
});

function Documents() {
  const { user } = useAuth();
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

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Service agreements, statements and setup guides we've shared with you.
      </p>

      {isPending && <p className="mt-8 text-lg text-muted-foreground">Loading…</p>}

      {!isPending && !data?.length && (
        <p className="mt-8 text-lg text-muted-foreground">No documents yet.</p>
      )}

      {!!data?.length && (
        <ul className="mt-8 divide-y divide-border rounded-sm border border-border">
          {data.map((doc) => (
            <li key={doc.id} className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                <FileText className="size-6 text-primary" aria-hidden />
                <div>
                  <p className="text-lg font-medium">{doc.title}</p>
                  <p className="text-muted-foreground">
                    {[doc.category, doc.size_label, doc.issued_on
                      ? new Date(doc.issued_on).toLocaleDateString("en-AU")
                      : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
              {doc.file_url && (
                <a
                  href={doc.file_url}
                  className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 text-lg font-medium hover:bg-secondary"
                >
                  <Download className="size-5" aria-hidden />
                  Download
                  <span className="sr-only">{doc.title}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
