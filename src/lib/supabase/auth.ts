import { redirect } from "next/navigation";

import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/** Profil, dessen Username feststeht — der einzige Zustand, den geschützte Seiten kennen. */
export type ProfileWithUsername = Profile & { username: string };

/**
 * Liefert die User-ID aus den JWT-Claims oder `null`.
 *
 * `getClaims()` statt `getUser()`: prüft die Signatur des Tokens und spart den
 * Netzwerk-Roundtrip. `getSession()` wird serverseitig nicht verwendet.
 */
export async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
}

/**
 * Guard für geschützte Server-Komponenten. Der Redirect im Proxy ist die
 * Bequemlichkeit, dieser Check die eigentliche Absicherung — beides ersetzt kein RLS.
 */
export async function requireUserId(): Promise<string> {
  const userId = await getUserId();
  if (!userId) {
    redirect("/login");
  }
  return userId;
}

/** Lädt die Profilzeile eines Nutzers, oder `null`, wenn keine existiert. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Profil konnte nicht geladen werden", { code: error.code, message: error.message });
    return null;
  }

  return data;
}

/**
 * Guard für alle Seiten hinter dem Onboarding: ohne Session zurück zum Login,
 * ohne Username zwangsweise auf `/onboarding` (`guidelines.md` 002).
 *
 * Ein fehlendes Profil wird wie ein fehlender Username behandelt — das
 * Onboarding legt die Zeile dann per `upsert` an.
 */
export async function requireProfile(): Promise<ProfileWithUsername> {
  const userId = await requireUserId();
  const profile = await getProfile(userId);

  if (!profile?.username) {
    redirect("/onboarding");
  }

  return profile as ProfileWithUsername;
}
