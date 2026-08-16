"use server";

import { revalidatePath } from "next/cache";

import {
  ACCENT_INVALID_MESSAGE,
  type AccentActionResult,
  GENERIC_PROFILE_ERROR,
  PROFILE_INVALID_MESSAGE,
  type ProfileFormState,
} from "@/lib/profile-form-state";
import { getProfile, requireUserId } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { safeAccent } from "@/lib/theme";
import { publicProfilePath } from "@/lib/username";
import { parseProfileInput } from "@/lib/validation/profile";

/** Liest ein Formularfeld als Text. Fehlt es oder ist es eine Datei, bleibt es leer. */
function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Speichert Anzeigename, Bio und Bild-Adresse des **eigenen** Profils.
 *
 * `eq("id", userId)` ist die zweite Schranke neben der RLS-Policy: Selbst wenn
 * eine Policy fiele, träfe dieses Update nur die eigene Zeile.
 *
 * Leere Felder werden zu `NULL` — der DB-Check auf `avatar_url` erlaubt `NULL`
 * oder einen `https://`-Wert, ein leerer String verletzt ihn.
 */
export async function updateProfile(
  _previousState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const userId = await requireUserId();

  const parsed = parseProfileInput({
    displayName: readField(formData, "displayName"),
    bio: readField(formData, "bio"),
    avatarUrl: readField(formData, "avatarUrl"),
  });

  if (!parsed.ok) {
    return { status: "error", message: PROFILE_INVALID_MESSAGE, fieldErrors: parsed.fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      bio: parsed.data.bio,
      avatar_url: parsed.data.avatarUrl,
    })
    .eq("id", userId)
    .select("id");

  if (error) {
    console.error("Profil konnte nicht gespeichert werden", {
      code: error.code,
      message: error.message,
    });
    return { status: "error", message: GENERIC_PROFILE_ERROR, fieldErrors: {} };
  }

  if (data.length === 0) {
    return { status: "error", message: GENERIC_PROFILE_ERROR, fieldErrors: {} };
  }

  await revalidateProfileViews(userId);

  return { status: "success", message: null, fieldErrors: {} };
}

/**
 * Dashboard, Profilseite und öffentliche Seite zeigen dieselben Daten — ohne
 * den letzten Aufruf zeigte ein Cache später noch den alten Stand.
 */
async function revalidateProfileViews(userId: string): Promise<void> {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profil");

  const profile = await getProfile(userId);
  if (profile?.username) {
    revalidatePath(publicProfilePath(profile.username));
  }
}

/**
 * Speichert die Akzentfarbe des **eigenen** Profils.
 *
 * Zweite Schranke der Validierungskette (Formular → hier → DB-`CHECK`). Weicht
 * der geprüfte Wert vom übergebenen ab, wird **nicht** gespeichert: Still den
 * Standardwert zu schreiben würde eine kaputte Eingabe kommentarlos als
 * Nutzerwunsch verbuchen. Auf der Leseseite gilt das Gegenteil — dort fällt
 * `safeAccent()` lautlos zurück, damit ein manipulierter Datenbankwert die
 * öffentliche Seite nicht zerlegt.
 */
export async function updateAccentColor(color: string): Promise<AccentActionResult> {
  const userId = await requireUserId();

  const accent = safeAccent(color);
  if (accent !== color) {
    return { ok: false, message: ACCENT_INVALID_MESSAGE };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ accent_color: accent })
    .eq("id", userId)
    .select("id");

  if (error) {
    console.error("Akzentfarbe konnte nicht gespeichert werden", {
      code: error.code,
      message: error.message,
    });
    return { ok: false, message: GENERIC_PROFILE_ERROR };
  }

  if (data.length === 0) {
    return { ok: false, message: GENERIC_PROFILE_ERROR };
  }

  await revalidateProfileViews(userId);

  return { ok: true };
}
