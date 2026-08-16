import type { LinkFieldErrors } from "@/lib/validation/link";

/**
 * Rückgabewerte der Link-Server-Actions.
 *
 * Liegt außerhalb von `actions.ts`: eine Datei mit `"use server"` darf
 * ausschließlich async Funktionen exportieren, keine Typen oder Konstanten.
 */
export type LinkActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: LinkFieldErrors };

/** Rohwerte aus dem Formular — ungeprüft, bis `parseLinkInput` sie gesehen hat. */
export type LinkFormValues = {
  title: string;
  url: string;
};

export const EMPTY_LINK_FORM_VALUES: LinkFormValues = {
  title: "",
  url: "",
};

/** Wird angezeigt, wenn die Aktion aus einem nicht näher bekannten Grund scheitert. */
export const GENERIC_LINK_ERROR = "Das hat gerade nicht geklappt. Bitte versuche es erneut.";
