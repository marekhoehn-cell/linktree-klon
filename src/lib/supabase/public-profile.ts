import { createClient } from "@/lib/supabase/server";
import { isValidHttpUrl } from "@/lib/validation/link";

/** Nur die Felder, die die öffentliche Seite wirklich rendert. */
export type PublicLink = {
  id: string;
  title: string;
  url: string;
};

export type PublicProfile = {
  username: string;
  displayName: string | null;
  bio: string | null;
  /** Bereits geprüfte `https://`-Adresse oder `null`. */
  avatarUrl: string | null;
  accentColor: string;
  links: PublicLink[];
};

/**
 * Zweite Prüfung einer Adresse aus der Datenbank, kurz bevor sie in ein
 * Attribut geht.
 *
 * Beim Speichern wurde bereits geprüft — aber die Regeln können sich ändern,
 * und ein Wert kann per SQL an der Anwendung vorbei in die Tabelle gelangen.
 * Ein ungültiger Wert führt hier nie zu einem Fehler, sondern verschwindet
 * stillschweigend (`CLAUDE.md` Kernprinzip 2).
 */
function safeAvatarUrl(value: string | null): string | null {
  if (value === null) return null;
  return /^https:\/\//i.test(value) && isValidHttpUrl(value) ? value : null;
}

/** Wie `safeAvatarUrl`, erlaubt zusätzlich `http://` — so wurden Links gespeichert. */
function safeLinkUrl(value: string): string | null {
  return isValidHttpUrl(value) ? value : null;
}

/**
 * Profil und aktive Links eines Usernamens — in **einer** Abfrage.
 *
 * Möglich wird das durch den Foreign Key `links_user_id_profiles_fkey`:
 * PostgREST bettet verschachtelte Ressourcen ausschließlich entlang echter
 * Foreign Keys ein.
 *
 * Der Filter `links.is_active = true` bleibt Pflicht, obwohl die Policy
 * `links_select_public_active` dasselbe tut: Ist der Betrachter zufällig der
 * Eigentümer, greift zusätzlich `links_select_own` — ohne diesen Filter sähe er
 * auf seiner eigenen öffentlichen Seite auch die deaktivierten Links.
 *
 * `null` heißt: Der Name ist nicht vergeben. Das ist kein Fehlerfall, sondern
 * führt zur Claim-Seite.
 */
export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("username, display_name, bio, avatar_url, accent_color, links(id, title, url)")
    .eq("username", username)
    .eq("links.is_active", true)
    // Zweites Kriterium wie im Dashboard: `sort_order` ist nicht eindeutig,
    // gleiche Werte sollen trotzdem stabil in derselben Reihenfolge stehen.
    .order("sort_order", { referencedTable: "links", ascending: true })
    .order("created_at", { referencedTable: "links", ascending: true })
    .maybeSingle();

  if (error) {
    console.error("Öffentliches Profil konnte nicht geladen werden", {
      code: error.code,
      message: error.message,
    });
    return null;
  }

  if (!data?.username) {
    return null;
  }

  return {
    username: data.username,
    displayName: data.display_name,
    bio: data.bio,
    avatarUrl: safeAvatarUrl(data.avatar_url),
    accentColor: data.accent_color,
    links: data.links.flatMap((link) => {
      const url = safeLinkUrl(link.url);
      return url === null ? [] : [{ id: link.id, title: link.title, url }];
    }),
  };
}
