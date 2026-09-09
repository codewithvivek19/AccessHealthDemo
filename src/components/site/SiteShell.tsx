import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="a-site flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="a-main flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
