import { z } from "zod";

import { isValidHttpUrl } from "@/lib/validation/link";

/** Obergrenzen aus der `profiles`-Tabelle (CHECK-Constraints auf `display_name` und `bio`). */
export const DISPLAY_NAME_MAX_LENGTH = 60;
export const BIO_MAX_LENGTH = 300;

export const DISPLAY_NAME_TOO_LONG_MESSAGE = `Der Anzeigename darf höchstens ${DISPLAY_NAME_MAX_LENGTH} Zeichen haben.`;
export const BIO_TOO_LONG_MESSAGE = `Die Bio darf höchstens ${BIO_MAX_LENGTH} Zeichen haben.`;
export const AVATAR_URL_PROTOCOL_MESSAGE =
  "Die Bild-Adresse muss mit https:// beginnen — http:// wird nicht akzeptiert.";
export const AVATAR_URL_INVALID_MESSAGE =
  "Das sieht nicht nach einer gültigen Adresse aus — zum Beispiel https://beispiel.de/bild.png";

/** Erlaubtes Protokoll für `avatar_url` — identisch zum DB-Check `~* '^https://'`. */
const HTTPS_PATTERN = /^https:\/\//i;

/**
 * Zählt Zeichen so, wie Postgres es tut.
 *
 * `char_length` zählt Codepoints, `String.prototype.length` dagegen
 * UTF-16-Einheiten: Ein Emoji wäre dort 2. Ohne diese Zählung meldet das
 * Formular „299 von 300", während die Datenbank den Wert schon ablehnt.
 */
export function countCharacters(value: string): number {
  return [...value].length;
}

/**
 * Vereinheitlicht Zeilenumbrüche auf `\n`.
 *
 * Ein `<textarea>` schickt laut HTML-Spezifikation `\r\n`. Ohne diesen Schritt
 * zählte der Browser eine Leerzeile als ein Zeichen, Postgres aber als zwei —
 * der Zeichenzähler stünde bei 300, die Prüfung schlüge trotzdem an.
 */
function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

/**
 * Ein optionales Textfeld: leer heißt `null`, nicht `""`.
 *
 * Für `avatar_url` ist das keine Kosmetik — der DB-Check erlaubt `NULL` **oder**
 * einen `https://`-Wert. Ein leerer String verletzt ihn.
 */
function optionalText(maxLength: number, tooLongMessage: string) {
  return z
    .string()
    .transform(normalizeNewlines)
    .transform((value) => value.trim())
    .transform((value) => (value.length === 0 ? null : value))
    .refine((value) => value === null || countCharacters(value) <= maxLength, {
      message: tooLongMessage,
    });
}

/**
 * Die drei Profilfelder, wie sie Formular und Server Action gleichermaßen prüfen.
 *
 * Die `https://`-Regel steht bewusst **vor** der allgemeinen Adressprüfung:
 * Bei `http://beispiel.de/x.png` soll der Nutzer erfahren, dass das Protokoll
 * das Problem ist — nicht die Adresse an sich.
 */
export const profileSchema = z.object({
  displayName: optionalText(DISPLAY_NAME_MAX_LENGTH, DISPLAY_NAME_TOO_LONG_MESSAGE),
  bio: optionalText(BIO_MAX_LENGTH, BIO_TOO_LONG_MESSAGE),
  avatarUrl: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : value))
    .refine((value) => value === null || HTTPS_PATTERN.test(value), {
      message: AVATAR_URL_PROTOCOL_MESSAGE,
    })
    .refine((value) => value === null || isValidHttpUrl(value), {
      message: AVATAR_URL_INVALID_MESSAGE,
    }),
});

/** Geprüfte Werte — das, was in die Datenbank geht. */
export type ProfileInput = z.infer<typeof profileSchema>;

/** Fehlermeldungen je Feld, wie sie das Formular anzeigt. */
export type ProfileFieldErrors = Partial<Record<keyof ProfileInput, string>>;

export type ProfileParseResult =
  | { ok: true; data: ProfileInput }
  | { ok: false; fieldErrors: ProfileFieldErrors };

const PROFILE_FIELDS = ["displayName", "bio", "avatarUrl"] as const;

/**
 * Prüft rohe Formularwerte. Läuft im Formular vor dem Absenden und in der Server
 * Action erneut — Client-Validierung ist Komfort, kein Schutz
 * (`CLAUDE.md` Kernprinzip 2).
 */
export function parseProfileInput(raw: {
  displayName: unknown;
  bio: unknown;
  avatarUrl: unknown;
}): ProfileParseResult {
  const result = profileSchema.safeParse(raw);

  if (result.success) {
    return { ok: true, data: result.data };
  }

  const fieldErrors: ProfileFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    const known = PROFILE_FIELDS.find((candidate) => candidate === field);
    if (known && !fieldErrors[known]) {
      fieldErrors[known] = issue.message;
    }
  }

  return { ok: false, fieldErrors };
}
