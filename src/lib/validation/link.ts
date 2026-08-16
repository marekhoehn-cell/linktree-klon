import { z } from "zod";

/** Obergrenze aus der `links`-Tabelle (CHECK-Constraint auf `title`). */
export const LINK_TITLE_MAX_LENGTH = 80;

export const TITLE_REQUIRED_MESSAGE = "Bitte gib einen Titel ein.";
export const TITLE_TOO_LONG_MESSAGE = `Der Titel darf höchstens ${LINK_TITLE_MAX_LENGTH} Zeichen haben.`;
export const URL_REQUIRED_MESSAGE = "Bitte gib eine Adresse ein.";
export const URL_INVALID_MESSAGE =
  "Das sieht nicht nach einer gültigen Adresse aus — zum Beispiel https://beispiel.de";

/** Ein vorangestelltes Protokoll, z. B. `https://` oder `mailto:` (ohne Doppel-Slash nicht erfasst). */
const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:\/\//i;

/** Hostname mit mindestens einem Punkt und einer Endung aus Buchstaben — `abc` fällt damit durch. */
const HOSTNAME_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

/**
 * Ergänzt `https://`, wenn der Nutzer das Protokoll weggelassen hat.
 *
 * Ein bereits vorhandenes Protokoll bleibt stehen — auch ein falsches wie
 * `ftp://`. Das fliegt danach bei der Prüfung raus, statt hier still
 * überschrieben zu werden.
 */
export function withHttpsPrefix(value: string): string {
  return SCHEME_PATTERN.test(value) ? value : `https://${value}`;
}

/** Akzeptiert ausschließlich `http`/`https` mit plausiblem Hostnamen. */
export function isValidHttpUrl(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  // `new URL()` wandelt Umlaut-Domains selbst in Punycode um — der Test greift also auch dort.
  return HOSTNAME_PATTERN.test(parsed.hostname);
}

/**
 * Ein Link, wie ihn Formular und Server Action gleichermaßen prüfen.
 *
 * Die URL wird **erst** normalisiert und **danach** geprüft: `beispiel.de`
 * wird zu `https://beispiel.de`, `abc` bleibt ungültig.
 */
export const linkSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, TITLE_REQUIRED_MESSAGE)
    .max(LINK_TITLE_MAX_LENGTH, TITLE_TOO_LONG_MESSAGE),
  url: z
    .string()
    .trim()
    .min(1, URL_REQUIRED_MESSAGE)
    .transform(withHttpsPrefix)
    .refine(isValidHttpUrl, { message: URL_INVALID_MESSAGE }),
});

/** Geprüfte und normalisierte Werte — das, was in die Datenbank geht. */
export type LinkInput = z.infer<typeof linkSchema>;

/** Fehlermeldungen je Feld, wie sie das Formular anzeigt. */
export type LinkFieldErrors = Partial<Record<keyof LinkInput, string>>;

export type LinkParseResult =
  | { ok: true; data: LinkInput }
  | { ok: false; fieldErrors: LinkFieldErrors };

/**
 * Obergrenze für eine Sortier-Anfrage. Weit über jeder realistischen Linkliste,
 * aber eine Grenze — ohne sie könnte ein manipulierter Client die
 * Datenbankfunktion mit einem beliebig langen Array beschäftigen.
 */
export const LINK_ORDER_MAX_LENGTH = 200;

/**
 * Die neue Reihenfolge, wie sie beim Server ankommt: **nur IDs**, keine
 * Positionen. Die Positionen leitet `reorder_links` selbst aus der
 * Array-Reihenfolge ab (`with ordinality`), damit ein manipulierter Client keine
 * krummen `sort_order`-Werte setzen kann.
 *
 * Doppelte IDs werden abgelehnt: sie würden in der Datenbankfunktion zu zwei
 * Zeilen mit widersprüchlicher Position führen.
 */
export const linkOrderSchema = z
  .array(z.uuid())
  .min(1)
  .max(LINK_ORDER_MAX_LENGTH)
  .refine((ids) => new Set(ids).size === ids.length);

/**
 * Prüft eine Sortier-Anfrage. Es gibt keine Feldfehler — die Reihenfolge kommt
 * nicht aus einem Formular, sondern aus der Liste selbst. Ein Fehlschlag heißt
 * deshalb immer: Der Aufruf kam nicht von unserer Oberfläche.
 */
export function parseLinkOrder(raw: unknown): { ok: true; data: string[] } | { ok: false } {
  const result = linkOrderSchema.safeParse(raw);
  return result.success ? { ok: true, data: result.data } : { ok: false };
}

/**
 * Prüft rohe Formularwerte. Wird vom Dialog vor dem Absenden und von jeder
 * Server Action erneut aufgerufen — Client-Validierung ist Komfort, kein Schutz
 * (`CLAUDE.md` Kernprinzip 2).
 */
export function parseLinkInput(raw: { title: unknown; url: unknown }): LinkParseResult {
  const result = linkSchema.safeParse(raw);

  if (result.success) {
    return { ok: true, data: result.data };
  }

  const fieldErrors: LinkFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if ((field === "title" || field === "url") && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return { ok: false, fieldErrors };
}
