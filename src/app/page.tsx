import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingHero } from "@/components/landing/landing-hero";
import { getUserId } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Linktree-Clone — alle deine Links unter einer Adresse",
  description:
    "Sammle deine wichtigsten Links auf einer Seite, sortiere sie per Drag-and-drop und gib sie mit einer einzigen Adresse weiter.",
};

/**
 * Startseite. Für Besucher ohne Session die Landingpage, für angemeldete
 * Nutzer nur eine Durchreiche aufs Dashboard.
 *
 * Der Fall „angemeldet, aber noch kein Username" wird hier bewusst nicht
 * behandelt: `dashboard/layout.tsx` nutzt `requireProfile()` und schickt solche
 * Nutzer selbst weiter auf `/onboarding`.
 */
export default async function HomePage() {
  const userId = await getUserId();

  if (userId) {
    redirect("/dashboard");
  }

  return <LandingHero />;
}
