import type { Metadata } from "next";

import { ProfileWorkspace } from "@/components/dashboard/profile-workspace";
import { requireProfile } from "@/lib/supabase/auth";
import { getLinks } from "@/lib/supabase/links";

export const metadata: Metadata = {
  title: "Profil",
};

/**
 * Split-View wie `/dashboard`: links der Arbeitsbereich, rechts ab `lg` die
 * sticky Vorschau. Die Links werden hier nur geladen, damit die Vorschau
 * dieselbe Seite zeigt wie im Link-Bereich — bearbeitet werden sie dort.
 */
export default async function ProfilePage() {
  const profile = await requireProfile();
  const links = await getLinks(profile.id);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 lg:py-12">
      <ProfileWorkspace profile={profile} links={links} />
    </div>
  );
}
