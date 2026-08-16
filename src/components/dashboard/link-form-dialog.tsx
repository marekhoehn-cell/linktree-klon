"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EMPTY_LINK_FORM_VALUES, type LinkFormValues } from "@/lib/link-form-state";
import {
  LINK_TITLE_MAX_LENGTH,
  type LinkFieldErrors,
  parseLinkInput,
} from "@/lib/validation/link";

type LinkFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Vorbelegung beim Bearbeiten. `null` heißt: neuer Link. */
  initialValues: LinkFormValues | null;
  /** Bekommt die geprüften Rohwerte. Das Speichern selbst läuft optimistisch weiter. */
  onSubmit: (values: LinkFormValues) => void;
};

/**
 * Ein Dialog für beide Fälle — Anlegen und Bearbeiten unterscheiden sich nur in
 * Vorbelegung und Beschriftung.
 *
 * Radix hängt den Inhalt beim Schließen aus dem Baum. Der Formular-State im
 * Kind setzt sich dadurch bei jedem Öffnen von selbst zurück — ohne `useEffect`.
 */
export function LinkFormDialog({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
}: LinkFormDialogProps) {
  const isEditing = initialValues !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Link bearbeiten" : "Neuer Link"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Änderungen erscheinen sofort in Liste und Vorschau."
              : "Der Link landet am Ende deiner Liste."}
          </DialogDescription>
        </DialogHeader>

        <LinkFormFields
          initialValues={initialValues ?? EMPTY_LINK_FORM_VALUES}
          submitLabel={isEditing ? "Änderungen speichern" : "Link hinzufügen"}
          onCancel={() => onOpenChange(false)}
          onSubmit={(values) => {
            onOpenChange(false);
            onSubmit(values);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

type LinkFormFieldsProps = {
  initialValues: LinkFormValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: LinkFormValues) => void;
};

function LinkFormFields({
  initialValues,
  submitLabel,
  onCancel,
  onSubmit,
}: LinkFormFieldsProps) {
  const [values, setValues] = useState<LinkFormValues>(initialValues);
  const [errors, setErrors] = useState<LinkFieldErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Dieselbe Prüfung läuft in der Server Action noch einmal — hier geht es nur
    // darum, den Fehler direkt am Feld zu zeigen (`CLAUDE.md` Kernprinzip 2).
    const parsed = parseLinkInput(values);
    if (!parsed.ok) {
      setErrors(parsed.fieldErrors);
      return;
    }

    onSubmit(values);
  }

  /** Beim Tippen verschwindet die Meldung des betroffenen Feldes wieder. */
  function updateField(field: keyof LinkFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field data-invalid={Boolean(errors.title)}>
        <FieldLabel htmlFor="link-title">Titel</FieldLabel>
        <Input
          id="link-title"
          name="title"
          value={values.title}
          onChange={(event) => updateField("title", event.target.value)}
          maxLength={LINK_TITLE_MAX_LENGTH}
          placeholder="Mein Portfolio"
          autoComplete="off"
          aria-invalid={Boolean(errors.title)}
          autoFocus
          className="h-11 rounded-xl transition-all duration-200 ease-out"
        />
        <FieldError>{errors.title}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.url)}>
        <FieldLabel htmlFor="link-url">Adresse</FieldLabel>
        <Input
          id="link-url"
          name="url"
          value={values.url}
          onChange={(event) => updateField("url", event.target.value)}
          inputMode="url"
          placeholder="beispiel.de"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={Boolean(errors.url)}
          aria-describedby="link-url-hint"
          className="h-11 rounded-xl transition-all duration-200 ease-out"
        />
        {errors.url ? (
          <FieldError>{errors.url}</FieldError>
        ) : (
          <p id="link-url-hint" className="text-muted-foreground text-xs">
            Ohne <span className="font-mono">https://</span> ergänzen wir es beim Speichern.
          </p>
        )}
      </Field>

      <DialogFooter className="rounded-b-2xl">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-11 rounded-xl px-5 text-sm font-medium transition-all duration-200 ease-out"
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          className="h-11 rounded-xl px-5 text-sm font-medium shadow-lg transition-all duration-200 ease-out hover:shadow-xl"
        >
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
