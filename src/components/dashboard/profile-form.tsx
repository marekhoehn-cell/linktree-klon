"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { updateProfile } from "@/app/dashboard/profil/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  EMPTY_PROFILE_FORM_STATE,
  PROFILE_SAVED_MESSAGE,
  type ProfileFormValues,
} from "@/lib/profile-form-state";
import { cn } from "@/lib/utils";
import {
  BIO_MAX_LENGTH,
  countCharacters,
  type ProfileFieldErrors,
  parseProfileInput,
} from "@/lib/validation/profile";

type ProfileFormProps = {
  values: ProfileFormValues;
  /** Hebt die Eingaben in die Klammer hoch, damit die Vorschau beim Tippen mitläuft. */
  onChange: (values: ProfileFormValues) => void;
};

/**
 * Formular für Anzeigename, Bio und Bild-Adresse.
 *
 * Zwei Prüfungen greifen ineinander: die hier beim Absenden (damit der Fehler
 * sofort am Feld steht) und dieselbe erneut in der Server Action
 * (`CLAUDE.md` Kernprinzip 2). Die Felder tragen deshalb **kein** `maxLength` —
 * sonst ließe sich ein zu langer Text gar nicht erst einfügen und der Nutzer
 * bekäme nie eine Erklärung, warum abgeschnitten wurde.
 */
export function ProfileForm({ values, onChange }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, EMPTY_PROFILE_FORM_STATE);
  const [localErrors, setLocalErrors] = useState<ProfileFieldErrors>({});
  /** Server-Feldfehler gelten nur bis zur nächsten Eingabe — danach sind sie veraltet. */
  const [showServerErrors, setShowServerErrors] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(PROFILE_SAVED_MESSAGE);
      return;
    }
    // Feldfehler stehen am Feld; nur die allgemeine Meldung wandert in den Toast.
    if (state.status === "error" && Object.keys(state.fieldErrors).length === 0 && state.message) {
      toast.error(state.message);
    }
    // `state` ist nach jedem Absenden ein neues Objekt — auch bei gleichem Inhalt.
  }, [state]);

  const errors: ProfileFieldErrors = {
    ...(showServerErrors ? state.fieldErrors : {}),
    ...localErrors,
  };

  function updateField(field: keyof ProfileFormValues, value: string) {
    onChange({ ...values, [field]: value });
    setLocalErrors((current) => ({ ...current, [field]: undefined }));
    setShowServerErrors(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const parsed = parseProfileInput(values);
    setShowServerErrors(true);

    if (!parsed.ok) {
      // Verhindert das Absenden — die Server Action läuft dann gar nicht erst an.
      event.preventDefault();
      setLocalErrors(parsed.fieldErrors);
      return;
    }

    setLocalErrors({});
  }

  // `\r\n` → `\n` wie in der Prüfung: Der Zähler zeigt sonst eine andere Länge
  // an, als Server und Datenbank später sehen.
  const bioLength = countCharacters(values.bio.replace(/\r\n/g, "\n").trim());
  const isBioTooLong = bioLength > BIO_MAX_LENGTH;

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <Field data-invalid={Boolean(errors.displayName)}>
        <FieldLabel htmlFor="displayName">Anzeigename</FieldLabel>
        <Input
          id="displayName"
          name="displayName"
          value={values.displayName}
          onChange={(event) => updateField("displayName", event.target.value)}
          placeholder="Anna Bauer"
          autoComplete="name"
          disabled={isPending}
          aria-invalid={Boolean(errors.displayName)}
          aria-describedby="displayName-hint"
          className="h-11 rounded-xl transition-all duration-200 ease-out"
        />
        {errors.displayName ? (
          <FieldError>{errors.displayName}</FieldError>
        ) : (
          <p id="displayName-hint" className="text-muted-foreground text-xs">
            Leer lassen zeigt <span className="font-mono">@username</span> auf deiner Seite.
          </p>
        )}
      </Field>

      <Field data-invalid={Boolean(errors.bio)}>
        <FieldLabel htmlFor="bio">Bio</FieldLabel>
        <textarea
          id="bio"
          name="bio"
          value={values.bio}
          onChange={(event) => updateField("bio", event.target.value)}
          rows={4}
          placeholder="Ein bis zwei Sätze über dich."
          disabled={isPending}
          aria-invalid={Boolean(errors.bio)}
          aria-describedby="bio-counter"
          // Bewusst kein shadcn-`Textarea`: Das Projekt hat die Komponente nicht,
          // und die Klassen sind hier 1:1 von `ui/input.tsx` übernommen, damit
          // Focus- und Invalid-Zustand identisch aussehen.
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 disabled:bg-input/50 w-full min-w-0 resize-y rounded-xl border bg-transparent px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm"
        />
        <div className="flex items-start justify-between gap-3">
          <FieldError>{errors.bio}</FieldError>
          <p
            id="bio-counter"
            aria-live="polite"
            className={cn(
              "text-muted-foreground ml-auto shrink-0 text-xs tabular-nums transition-colors duration-200 ease-out",
              isBioTooLong && "text-destructive font-medium",
            )}
          >
            {bioLength} / {BIO_MAX_LENGTH}
          </p>
        </div>
      </Field>

      <Field data-invalid={Boolean(errors.avatarUrl)}>
        <FieldLabel htmlFor="avatarUrl">Bild-Adresse</FieldLabel>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          value={values.avatarUrl}
          onChange={(event) => updateField("avatarUrl", event.target.value)}
          inputMode="url"
          placeholder="https://beispiel.de/bild.png"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          disabled={isPending}
          aria-invalid={Boolean(errors.avatarUrl)}
          aria-describedby="avatarUrl-hint"
          className="h-11 rounded-xl font-mono text-xs transition-all duration-200 ease-out sm:text-sm"
        />
        {errors.avatarUrl ? (
          <FieldError>{errors.avatarUrl}</FieldError>
        ) : (
          <p id="avatarUrl-hint" className="text-muted-foreground text-xs">
            Nur <span className="font-mono">https://</span> — das Bild liegt woanders, wir laden es
            nur ein.
          </p>
        )}
      </Field>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="h-11 min-w-11 rounded-2xl px-5 text-sm font-medium shadow-lg transition-all duration-200 ease-out hover:shadow-xl disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Wird gespeichert …
            </>
          ) : (
            "Profil speichern"
          )}
        </Button>
      </div>
    </form>
  );
}
