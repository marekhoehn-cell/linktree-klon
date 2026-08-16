/** Ziel, wenn kein oder ein unbrauchbares `next` mitkommt. */
export const DEFAULT_NEXT_PATH = "/dashboard";

/**
 * Prüft den `next`-Parameter aus dem Bestätigungslink.
 *
 * Der Wert steht in einer Adresse, die per E-Mail verschickt wird — er ist damit
 * Nutzereingabe. Ohne Prüfung wäre `?next=https://fremde-seite.example` ein
 * Open Redirect: Der Link käme glaubwürdig aus unserer Mail und würde trotzdem
 * woanders landen. Erlaubt sind deshalb nur seiteneigene Pfade.
 *
 * `//host` fliegt mit raus: Browser lesen das als protokollrelative Adresse.
 */
export function toSafeNextPath(value: string | null | undefined): string {
  if (!value) return DEFAULT_NEXT_PATH;
  if (!value.startsWith("/")) return DEFAULT_NEXT_PATH;
  if (value.startsWith("//")) return DEFAULT_NEXT_PATH;
  // Ein Backslash wird von manchen Browsern wie ein Schrägstrich behandelt.
  if (value.startsWith("/\\")) return DEFAULT_NEXT_PATH;
  return value;
}
