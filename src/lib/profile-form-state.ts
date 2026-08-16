import type { ProfileFieldErrors } from "@/lib/validation/profile";

/**
 * Zustände rund um die Profil-Section.
 *
 * Liegt außerhalb von `actions.ts`: eine Datei mit `"use server"` darf
 * ausschließlich async Funktionen exportieren, keine Typen oder Konstanten.
 */

/** Rohwerte aus dem Formular — ungeprüft, bis `parseProfileInput` sie gesehen hat. */
export type ProfileFormValues = {
  displayName: string;
  bio: string;
  avatarUrl: string;
};

/** Rückgabewert von `updateProfile` für `useActionState`. */
export type ProfileFormState = {
  status: "idle" | "success" | "error";
  /** Nur bei `error` gesetzt: die allgemeine Meldung über dem Formular. */
  message: string | null;
  fieldErrors: ProfileFieldErrors;
};

export const EMPTY_PROFILE_FORM_STATE: ProfileFormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export const PROFILE_SAVED_MESSAGE = "Profil gespeichert.";
export const PROFILE_INVALID_MESSAGE = "Bitte prüfe deine Eingaben.";

/** Wird angezeigt, wenn das Speichern aus einem nicht näher bekannten Grund scheitert. */
export const GENERIC_PROFILE_ERROR = "Das hat gerade nicht geklappt. Bitte versuche es erneut.";

/**
 * Rückgabewert von `updateAccentColor`.
 *
 * Kein `useActionState`-Zustand: Die Farbe wird nicht über ein `<form>`
 * abgeschickt, sondern direkt mit dem gewählten Wert aufgerufen.
 */
export type AccentActionResult = { ok: true } | { ok: false; message: string };

export const ACCENT_SAVED_MESSAGE = "Farbe gespeichert.";
export const ACCENT_INVALID_MESSAGE = "Diese Farbe ist keine gültige Hex-Angabe.";
