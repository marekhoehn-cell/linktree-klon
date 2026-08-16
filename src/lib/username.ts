/**
 * Username-Regeln aus `guidelines.md` 002 — bewusst frei von Server-Imports,
 * damit Client und Server dieselbe Prüfung verwenden können.
 */

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

/** Nur Kleinbuchstaben, Ziffern, Bindestrich und Unterstrich. */
export const USERNAME_PATTERN = /^[a-z0-9_-]+$/;

/**
 * Namen, die nicht vergeben werden dürfen. `/u/` trennt den Namespace bereits
 * physisch — diese Liste schützt nur noch gegen Verwechslung.
 */
export const RESERVED_USERNAMES = [
  "admin",
  "root",
  "api",
  "auth",
  "login",
  "logout",
  "signup",
  "dashboard",
  "settings",
  "onboarding",
  "u",
  "www",
  "support",
  "help",
] as const;

/** Einheitliche Meldung für Verfügbarkeitsanzeige und Kollision beim Speichern. */
export const USERNAME_TAKEN_MESSAGE = "Dieser Name ist leider schon vergeben.";

/** Platzhalter-Host für die Adressvorschau, solange keine echte Domain existiert. */
export const PUBLIC_PROFILE_HOST = "deine-domain.de";

/** Öffentlicher Pfad eines Profils. */
export function publicProfilePath(username: string): string {
  return `/u/${username}`;
}

/** Trimmt und senkt die Groß-/Kleinschreibung — der einzige erlaubte Eingriff in die Eingabe. */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export type UsernameValidation =
  | { ok: true; username: string }
  | { ok: false; message: string };

/**
 * Prüft eine Roh-Eingabe gegen alle Username-Regeln.
 *
 * Nimmt `unknown`, weil der Wert serverseitig aus `FormData` kommt und dort
 * auch `File` oder `null` sein kann.
 */
export function validateUsername(raw: unknown): UsernameValidation {
  if (typeof raw !== "string") {
    return { ok: false, message: "Bitte gib einen Usernamen ein." };
  }

  const username = normalizeUsername(raw);

  if (username.length === 0) {
    return { ok: false, message: "Bitte gib einen Usernamen ein." };
  }

  if (username.length < USERNAME_MIN_LENGTH) {
    return {
      ok: false,
      message: `Der Username braucht mindestens ${USERNAME_MIN_LENGTH} Zeichen.`,
    };
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      message: `Der Username darf höchstens ${USERNAME_MAX_LENGTH} Zeichen haben.`,
    };
  }

  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      message: "Erlaubt sind nur Kleinbuchstaben, Ziffern, Bindestrich und Unterstrich.",
    };
  }

  if (RESERVED_USERNAMES.includes(username as (typeof RESERVED_USERNAMES)[number])) {
    return { ok: false, message: "Dieser Name ist reserviert." };
  }

  return { ok: true, username };
}
