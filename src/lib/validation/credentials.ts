import { z } from "zod";

/** Passwort-Untergrenze. Gleicher Wert wie im Supabase-Dashboard hinterlegt. */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Obergrenze von bcrypt: alles darüber wird beim Hashen stillschweigend
 * abgeschnitten — lieber vorher mit klarer Meldung ablehnen.
 */
export const PASSWORD_MAX_LENGTH = 72;

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Bitte eine gültige E-Mail-Adresse eingeben.")),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Das Passwort braucht mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`)
    .max(PASSWORD_MAX_LENGTH, `Das Passwort darf höchstens ${PASSWORD_MAX_LENGTH} Zeichen haben.`),
});

export type Credentials = z.infer<typeof credentialsSchema>;
