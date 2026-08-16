import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/app/(auth)/actions";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import { PUBLIC_PROFILE_HOST, publicProfilePath } from "@/lib/username";

type DashboardHeaderProps = {
  username: string;
};

/**
 * Kopfzeile des Arbeitsbereichs: eigene Adresse, Kopier-Schaltfläche, Abmelden.
 *
 * Server-Komponente — nur `CopyLinkButton` braucht den Browser.
 */
export function DashboardHeader({ username }: DashboardHeaderProps) {
  const path = publicProfilePath(username);

  return (
    <header className="border-border/60 bg-card/70 supports-[backdrop-filter]:bg-card/50 sticky top-0 z-30 border-b backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        {/* Unter `sm` weggelassen: das Dashboard ist die Startseite, und der Platz
            gehört dort der Adresse. So bleibt die Kopfzeile einzeilig. */}
        <Link
          href="/dashboard"
          className="focus-visible:ring-ring mr-auto hidden h-11 items-center rounded-xl px-2 text-sm font-semibold tracking-tight transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none sm:inline-flex"
        >
          Linktree-Clone
        </Link>

        <Link
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border bg-card hover:border-ring/50 focus-visible:ring-ring group mr-auto inline-flex h-11 min-w-0 items-center gap-2 rounded-2xl border px-3 font-mono text-xs transition-all duration-200 ease-out hover:shadow-sm focus-visible:ring-2 focus-visible:outline-none sm:mr-0 sm:px-4"
        >
          <span className="text-muted-foreground hidden sm:inline">{PUBLIC_PROFILE_HOST}</span>
          <span className="text-foreground truncate font-medium">{path}</span>
          <ExternalLink
            className="text-muted-foreground group-hover:text-foreground size-3.5 transition-colors duration-200 ease-out"
            aria-hidden="true"
          />
          <span className="sr-only">Öffentliche Seite in neuem Tab öffnen</span>
        </Link>

        <CopyLinkButton path={path} />

        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-muted h-11 min-w-11 shrink-0 gap-2 rounded-2xl px-3 text-sm font-medium transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 sm:px-4"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Abmelden</span>
            <span className="sr-only sm:hidden">Abmelden</span>
          </Button>
        </form>
      </div>

      {/* Eigene Zeile statt eingeschoben in die obere: Auf 390 px teilen sich
          Adresse, Kopieren und Abmelden den Platz bereits vollständig. */}
      <div className="border-border/40 mx-auto flex w-full max-w-7xl border-t px-4 sm:px-6">
        <DashboardNav />
      </div>
    </header>
  );
}
