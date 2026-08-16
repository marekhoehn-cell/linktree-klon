/**
 * Zustände rund um die Username-Vergabe.
 *
 * Liegt außerhalb von `actions.ts`: eine Datei mit `"use server"` darf
 * ausschließlich async Funktionen exportieren, keine Typen oder Konstanten.
 */

/** Rückgabewert von `claimUsername` für `useActionState`. */
export type UsernameFormState = {
  error: string | null;
};

export const EMPTY_USERNAME_FORM_STATE: UsernameFormState = {
  error: null,
};

/** Ergebnis der Verfügbarkeitsprüfung während der Eingabe. */
export type UsernameCheckResult =
  | { status: "available" }
  | { status: "taken"; message: string }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };
