import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { toSafeNextPath } from "@/lib/next-path";
import { createClient } from "@/lib/supabase/server";

/** Typen, die dieses Projekt tatsächlich verschickt. `signup` und `magiclink` sind abgekündigt. */
const ALLOWED_TYPES: readonly EmailOtpType[] = ["email", "recovery", "email_change"];

function parseType(value: string | null): EmailOtpType | null {
  return ALLOWED_TYPES.find((allowed) => allowed === value) ?? null;
}

/**
 * Endpunkt des Links aus der Bestätigungsmail.
 *
 * Supabase hängt `token_hash` und `type` an; `verifyOtp` tauscht beides gegen
 * eine Session und setzt die Cookies. Erst danach ist der Nutzer angemeldet —
 * ohne diese Route führt der Link aus der Mail ins Leere, sobald die
 * E-Mail-Bestätigung eingeschaltet ist.
 *
 * Damit der Link hier ankommt, muss die E-Mail-Vorlage in Supabase auf
 * `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}`
 * zeigen — die Standardvorlage nutzt `{{ .ConfirmationURL }}` und läuft am
 * serverseitigen Weg vorbei.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = parseType(searchParams.get("type"));
  const next = toSafeNextPath(searchParams.get("next"));

  if (!tokenHash || !type) {
    console.error("Bestätigungslink unvollständig", { hasToken: Boolean(tokenHash), type });
    redirect("/auth/fehler");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    // Häufigster Fall: Der Link ist abgelaufen oder wurde bereits benutzt.
    console.error("Bestätigung fehlgeschlagen", { code: error.code, message: error.message });
    redirect("/auth/fehler");
  }

  // redirect() wirft intern eine Kontroll-Exception — deshalb außerhalb von try/catch.
  redirect(next);
}
