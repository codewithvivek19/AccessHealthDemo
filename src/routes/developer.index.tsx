import { createFileRoute } from "@tanstack/react-router";
import { ProjectWorkspace } from "@/components/portal/ProjectWorkspace";
export const Route = createFileRoute("/developer/")({ component: ProjectWorkspace });
