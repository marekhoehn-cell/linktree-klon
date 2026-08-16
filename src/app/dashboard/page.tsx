import type { Metadata } from "next";

import { LinksWorkspace } from "@/components/dashboard/links-workspace";
import { requireProfile } from "@/lib/supabase/auth";
import { getLinks } from "@/lib/supabase/links";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Split-View: links der Arbeitsbereich, rechts ab `lg` die sticky Vorschau.
 *
 * Geladen wird hier auf dem Server; die `LinksWorkspace` übernimmt beide
 * Spalten, weil Liste und Vorschau denselben optimistischen Stand zeigen.
 */
export default async function DashboardPage() {
  const profile = await requireProfile();
  const links = await getLinks(profile.id);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 lg:py-12">
      <LinksWorkspace links={links} profile={profile} />
    </div>
  );
}
