import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { requireProfile } from "@/lib/supabase/auth";

/**
 * Zweiter Guard neben dem Proxy: Der Proxy-Redirect ist die Bequemlichkeit,
 * dieser Check die eigentliche Absicherung. Beides ersetzt kein RLS.
 *
 * `requireProfile()` schiebt zusätzlich jeden Nutzer ohne Username ins
 * Onboarding zurück (`guidelines.md` 002).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    // Kein `min-h-full`: Das würde zusätzlich zur vollen Body-Höhe zählen und
    // mit der Fußzeile darunter auf jeder Dashboard-Seite eine Scrollleiste
    // erzwingen. `flex-1` streckt den Bereich bereits auf den freien Rest.
    <div className="from-background via-background to-muted/30 flex flex-1 flex-col bg-linear-to-b">
      <DashboardHeader username={profile.username} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
