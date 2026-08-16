"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { AuthFormState } from "@/lib/auth-form-state";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { validateUsername } from "@/lib/username";
import { credentialsSchema, type Credentials } from "@/lib/validation/credentials";

/**
 * Bewusst identisch für unbekannte E-Mail und falsches Passwort:
 * eine unterscheidbare Meldung würde verraten, welche Adressen registriert sind.
 */
const GENERIC_SIGN_IN_ERROR = "E-Mail oder Passwort ist falsch.";

function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

function toFieldErrors(error: z.ZodError<Credentials>): AuthFormState {
  const { fieldErrors } = z.flattenError(error);
  return {
    formError: null,
    fieldErrors: {
      email: fieldErrors.email?.[0],
      password: fieldErrors.password?.[0],
    },
  };
}

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return toFieldErrors(parsed.error);
  }

  // Von der Claim-Seite mitgebrachter Name: erneut geprüft, dann an das
  // Onboarding weitergereicht, wo er das Feld vorbelegt. Ein manipulierter Wert
  // fällt hier raus und der Nutzer landet auf dem leeren Formular.
  const preset = validateUsername(formData.get("username"));
  const nextPath = preset.ok
    ? `/onboarding?username=${encodeURIComponent(preset.username)}`
    : "/onboarding";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Ziel des Links aus der Bestätigungsmail. Absolut, weil die Adresse den
      // Browser aus dem Postfach heraus erreicht: `getSiteUrl()` liefert lokal
      // localhost und in der Produktion die echte Domain.
      emailRedirectTo: new URL(
        `/auth/confirm?next=${encodeURIComponent(nextPath)}`,
        getSiteUrl(),
      ).toString(),
    },
  });

  if (error) {
    console.error("Sign-up fehlgeschlagen", { code: error.code, message: error.message });
    return {
      formError:
        error.code === "user_already_exists"
          ? "Für diese E-Mail existiert bereits ein Konto. Melde dich stattdessen an."
          : "Die Registrierung hat nicht geklappt. Bitte versuche es erneut.",
      fieldErrors: {},
    };
  }

  // Ist die E-Mail-Bestätigung eingeschaltet, kommt keine Session zurück — der
  // Nutzer muss erst den Link im Postfach klicken. Ist sie aus (Entwicklung),
  // ist er sofort angemeldet und geht direkt weiter. Beide Wege müssen tragen,
  // weil der Schalter zwischen Entwicklung und Produktion unterschiedlich steht.
  if (!data.session) {
    // Hinweis: Ist die Adresse bereits registriert, antwortet Supabase bei
    // aktivierter Bestätigung absichtlich genauso wie bei einer neuen — sonst
    // ließe sich hier durchprobieren, welche Adressen ein Konto haben.
    return {
      formError: null,
      fieldErrors: {},
      confirmationSentTo: parsed.data.email,
    };
  }

  revalidatePath("/", "layout");

  // redirect() wirft intern eine Kontroll-Exception — deshalb außerhalb von try/catch.
  redirect(nextPath);
}

export async function signIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return toFieldErrors(parsed.error);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Im Formular bleibt die Meldung generisch; der echte Grund gehört nur ins Server-Log.
    console.error("Anmeldung fehlgeschlagen", { code: error.code, message: error.message });
    return { formError: GENERIC_SIGN_IN_ERROR, fieldErrors: {} };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Abmelden fehlgeschlagen", error);
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
