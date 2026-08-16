import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { ClaimPage } from "@/components/profile/claim-page";
import { ProfileView } from "@/components/profile/profile-view";
import { getPublicProfile } from "@/lib/supabase/public-profile";
import { normalizeUsername, publicProfilePath, validateUsername } from "@/lib/username";

/**
 * `cache()` bündelt die Abfrage für **einen** Request: `generateMetadata()` und
 * die Seite selbst brauchen dieselben Daten, sollen die Datenbank dafür aber
 * nur einmal fragen.
 */
const loadProfile = cache(getPublicProfile);

/**
 * Formal ungültige Namen (falsche Zeichen, zu kurz, zu lang, reserviert)
 * ergeben `null` — daraus wird eine echte 404, **nicht** die Claim-Seite. Wer
 * `/u/ab` aufruft, hat keinen freien Namen gefunden, sondern einen unmöglichen.
 */
function resolveUsername(raw: string): string | null {
  const validation = validateUsername(raw);
  return validation.ok ? validation.username : null;
}

/** Obergrenze, ab der Suchmaschinen und Messenger ohnehin abschneiden. */
const META_DESCRIPTION_MAX_LENGTH = 160;

/**
 * Macht aus einer mehrzeiligen Bio eine einzeilige Beschreibung.
 *
 * Kein Schönheitsschritt: Next verwirft Meta-Beschreibungen, die einen
 * Zeilenumbruch enthalten — das Tag fehlt dann ersatzlos im Quelltext. Auf der
 * Seite selbst bleiben die Umbrüche erhalten (`whitespace-pre-line`).
 */
function toMetaDescription(value: string): string {
  const singleLine = value.replace(/\s+/g, " ").trim();
  return singleLine.length > META_DESCRIPTION_MAX_LENGTH
    ? `${singleLine.slice(0, META_DESCRIPTION_MAX_LENGTH - 1).trimEnd()}…`
    : singleLine;
}

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username: raw } = await params;
  const username = resolveUsername(raw);

  if (username === null) {
    return { title: "Seite nicht gefunden" };
  }

  const profile = await loadProfile(username);

  if (profile === null) {
    return {
      title: `@${username} ist noch frei`,
      description: `Den Namen @${username} hat sich bisher niemand gesichert.`,
    };
  }

  const title = profile.displayName ?? `@${profile.username}`;
  const description =
    profile.bio === null
      ? `Alle Links von @${profile.username} auf einen Blick.`
      : toMetaDescription(profile.bio);
  const path = publicProfilePath(profile.username);

  // `openGraph.images` wird bewusst nicht gesetzt: Next hängt das aus
  // `opengraph-image.tsx` erzeugte Bild automatisch an.
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Öffentliche Profilseite — ohne Anmeldung erreichbar (der Proxy lässt `/u`
 * ausdrücklich durch) und vollständig serverseitig gerendert.
 *
 * Drei Ausgänge:
 * - Name formal ungültig → 404
 * - Name gültig, aber nicht vergeben → Claim-Seite
 * - Name vergeben → die Seite
 */
export default async function PublicProfilePage({ params }: PageProps<"/u/[username]">) {
  // In Next 16 ist `params` ein Promise und muss awaitet werden.
  const { username: raw } = await params;
  const username = resolveUsername(raw);

  if (username === null) {
    notFound();
  }

  // `/u/MaxMuster` und `/u/maxmuster` sind dieselbe Seite. Statt beide
  // auszuliefern, führt die abweichende Schreibweise auf die kanonische Adresse.
  if (raw !== normalizeUsername(raw)) {
    redirect(publicProfilePath(username));
  }

  const profile = await loadProfile(username);

  if (profile === null) {
    return (
      <main className="flex flex-1 flex-col justify-center">
        <ClaimPage username={username} />
      </main>
    );
  }

  // Der Grund kommt aus `src/app/u/layout.tsx` — hier steht nur der Inhalt.
  return (
    <main className="flex flex-1 flex-col">
      <ProfileView
        username={profile.username}
        displayName={profile.displayName}
        bio={profile.bio}
        avatarUrl={profile.avatarUrl}
        accentColor={profile.accentColor}
        links={profile.links}
      />
    </main>
  );
}
