/**
 * Rückgabewert der Auth-Actions für `useActionState`.
 *
 * Liegt bewusst außerhalb von `actions.ts`: eine Datei mit `"use server"` darf
 * ausschließlich async Funktionen exportieren, keine Konstanten.
 */
export type AuthFormState = {
  /** Fehler, der das ganze Formular betrifft (z. B. falsche Zugangsdaten). */
  formError: string | null;
  /** Fehler an einzelnen Feldern, aus der Zod-Prüfung. */
  fieldErrors: {
    email?: string;
    password?: string;
  };
  /**
   * Adresse, an die eine Bestätigungsmail ging — gesetzt nur beim Sign-up mit
   * aktivierter E-Mail-Bestätigung. Ist der Wert da, tritt das Formular hinter
   * den Hinweis zurück: ohne Klick im Postfach gibt es hier nichts mehr zu tun.
   */
  confirmationSentTo?: string | null;
};

export const EMPTY_AUTH_FORM_STATE: AuthFormState = {
  formError: null,
  fieldErrors: {},
  confirmationSentTo: null,
};
