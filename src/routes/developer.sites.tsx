import { createFileRoute } from "@tanstack/react-router";
import { SiteDirectory } from "@/components/portal/SiteDirectory";
export const Route = createFileRoute("/developer/sites")({ component: SiteDirectory });
