import { createFileRoute } from "@tanstack/react-router";
import { SiteDirectory } from "@/components/portal/SiteDirectory";
export const Route = createFileRoute("/operator/sites")({ component: SiteDirectory });
