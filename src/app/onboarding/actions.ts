"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserId } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { USERNAME_TAKEN_MESSAGE, validateUsername } from "@/lib/username";
import type { UsernameCheckResult, UsernameFormState } from "@/lib/username-form-state";

/** Postgres-Fehlercode einer verletzten Unique-Constraint. */
const UNIQUE_VIOLATION = "23505";

/**
 * Verfügbarkeitsprüfung während der Eingabe.
 *
 * Reine Komfortfunktion: Zwischen dieser Antwort und dem Absenden kann sich der
 * Name jederzeit ändern — die verbindliche Entscheidung fällt erst die
 * Unique-Constraint in `claimUsername`.
 */
export async function checkUsernameAvailability(
  rawUsername: string,
): Promise<UsernameCheckResult> {
  await requireUserId();

  const validation = validateUsername(rawUsername);
  if (!validation.ok) {
    return { status: "invalid", message: validation.message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", validation.username)
    .maybeSingle();

  if (error) {
    console.error("Verfügbarkeitsprüfung fehlgeschlagen", {
      code: error.code,
      message: error.message,
    });
    return { status: "error", message: "Die Verfügbarkeit ließ sich gerade nicht prüfen." };
  }

  return data ? { status: "taken", message: USERNAME_TAKEN_MESSAGE } : { status: "available" };
}

/**
 * Schreibt den gewählten Namen ins Profil.
 *
 * `upsert` statt `update`, damit ein Konto auch dann durchkommt, wenn der
 * Sign-up-Trigger die Profilzeile nicht angelegt hat. Die RLS-Policies lassen
 * nur die eigene Zeile zu (`id = auth.uid()`).
 */
export async function claimUsername(
  _previousState: UsernameFormState,
  formData: FormData,
): Promise<UsernameFormState> {
  const userId = await requireUserId();

  const validation = validateUsername(formData.get("username"));
  if (!validation.ok) {
    return { error: validation.message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, username: validation.username }, { onConflict: "id" });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: USERNAME_TAKEN_MESSAGE };
    }
    console.error("Username konnte nicht gespeichert werden", {
      code: error.code,
      message: error.message,
    });
    return { error: "Der Name ließ sich nicht speichern. Bitte versuche es erneut." };
  }

  revalidatePath("/", "layout");
  // redirect() wirft intern eine Kontroll-Exception — deshalb außerhalb von try/catch.
  redirect("/dashboard");
}
