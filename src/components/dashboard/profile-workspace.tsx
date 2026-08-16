"use client";

import { useState } from "react";

import { AccentPicker } from "@/components/dashboard/accent-picker";
import { PreviewPanel } from "@/components/dashboard/preview-panel";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ProfileView } from "@/components/profile/profile-view";
import type { ProfileFormValues } from "@/lib/profile-form-state";
import type { ProfileWithUsername } from "@/lib/supabase/auth";
import type { Link } from "@/lib/supabase/links";
import { safeAccent } from "@/lib/theme";
import { parseProfileInput } from "@/lib/validation/profile";

type ProfileWorkspaceProps = {
  profile: ProfileWithUsername;
  /** Nur zur Anzeige in der Vorschau — sortiert und unveränderlich auf dieser Seite. */
  links: Link[];
};

/** Leere Datenbankfelder werden im Formular zu leeren Eingaben, nicht zu „null". */
function toFormValues(profile: ProfileWithUsername): ProfileFormValues {
  return {
    displayName: profile.display_name ?? "",
    bio: profile.bio ?? "",
    avatarUrl: profile.avatar_url ?? "",
  };
}

/**
 * Klammer um Formular **und** Vorschau: Der Eingabestand liegt hier, damit die
 * Vorschau schon beim Tippen mitläuft — nicht erst nach dem Speichern.
 *
 * Die Bild-Adresse durchläuft für die Vorschau dieselbe Prüfung wie beim
 * Speichern. Halbfertige Eingaben (`https:/`, `javascript:…`) landen so nie im
 * `src`-Attribut, sondern zeigen den Initialen-Platzhalter.
 */
export function ProfileWorkspace({ profile, links }: ProfileWorkspaceProps) {
  const [values, setValues] = useState<ProfileFormValues>(() => toFormValues(profile));
  // Eigener Zustand neben dem Formular: Die Farbe hat ihre eigene Server Action
  // und ihren eigenen Speichern-Schritt, wirkt in der Vorschau aber sofort.
  const [accent, setAccent] = useState(() => safeAccent(profile.accent_color));

  const avatarCheck = parseProfileInput({ displayName: "", bio: "", avatarUrl: values.avatarUrl });
  const previewAvatarUrl = avatarCheck.ok ? avatarCheck.data.avatarUrl : null;

  const trimmedName = values.displayName.trim();
  const trimmedBio = values.bio.trim();

  return (
    <>
      <section className="min-w-0">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">Dein Profil</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Steht über deinen Links. Alle Felder dürfen leer bleiben.
          </p>
        </div>

        {/* `max-w-2xl`: Eingabefelder über die volle Spaltenbreite wirken leer,
            und lange Zeilen sind schlechter zu lesen. */}
        <div className="border-border/60 bg-card/70 from-card to-card/60 max-w-2xl rounded-2xl border bg-gradient-to-b p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_-16px_rgba(0,0,0,0.35)] sm:p-6">
          <ProfileForm values={values} onChange={setValues} />
        </div>

        <div className="mt-8 mb-6">
          <h2 className="text-lg font-semibold tracking-tight">Deine Farbe</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Färbt die Karten auf deiner öffentlichen Seite. Die Beschriftung passt sich automatisch
            an.
          </p>
        </div>

        <div className="border-border/60 bg-card/70 from-card to-card/60 max-w-2xl rounded-2xl border bg-gradient-to-b p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_-16px_rgba(0,0,0,0.35)] sm:p-6">
          <AccentPicker
            value={accent}
            onChange={setAccent}
            savedValue={safeAccent(profile.accent_color)}
          />
        </div>
      </section>

      <PreviewPanel>
        <ProfileView
          username={profile.username}
          displayName={trimmedName.length > 0 ? trimmedName : null}
          bio={trimmedBio.length > 0 ? trimmedBio : null}
          avatarUrl={previewAvatarUrl}
          accentColor={accent}
          // Wie die öffentliche Seite: Nur aktive Links stehen in der Vorschau.
          links={links.filter((link) => link.is_active)}
          variant="preview"
        />
      </PreviewPanel>
    </>
  );
}
