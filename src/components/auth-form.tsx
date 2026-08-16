"use client";

import { LoaderCircle, MailCheck } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EMPTY_AUTH_FORM_STATE, type AuthFormState } from "@/lib/auth-form-state";

type AuthFormProps = {
  /** Server Action — `signIn` oder `signUp` aus src/app/(auth)/actions.ts. */
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  pendingLabel: string;
  /** Autocomplete-Hinweis für den Passwortmanager: neues vs. bestehendes Passwort. */
  passwordAutoComplete: "new-password" | "current-password";
  passwordHint?: string;
  /**
   * Von der Claim-Seite mitgebrachter Username. Er wird nur weitergereicht,
   * damit das Onboarding ihn vorbelegen kann — gesichert wird er erst dort.
   */
  presetUsername?: string | null;
};

export function AuthForm({
  action,
  submitLabel,
  pendingLabel,
  passwordAutoComplete,
  passwordHint,
  presetUsername = null,
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, EMPTY_AUTH_FORM_STATE);

  // Bestätigungsmail ist unterwegs: Das Formular hat seinen Zweck erfüllt und
  // würde nur zum erneuten Absenden verleiten. Weiter geht es im Postfach.
  if (state.confirmationSentTo) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-border bg-muted/40 flex flex-col gap-2 rounded-xl border px-4 py-5 text-sm"
      >
        <p className="text-foreground flex items-center gap-2 font-medium">
          <MailCheck className="size-4 shrink-0" aria-hidden="true" />
          Schau in dein Postfach
        </p>
        <p className="text-muted-foreground">
          Wir haben eine Bestätigungsmail an{" "}
          <span className="text-foreground font-medium">{state.confirmationSentTo}</span> geschickt.
          Klick den Link darin, dann geht es weiter.
        </p>
        <p className="text-muted-foreground">
          Nichts angekommen? Der Spam-Ordner ist der häufigste Grund.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {presetUsername ? <input type="hidden" name="username" value={presetUsername} /> : null}

      <FieldGroup>
        <Field data-invalid={Boolean(state.fieldErrors.email)}>
          <FieldLabel htmlFor="email">E-Mail</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="du@beispiel.de"
            required
            disabled={isPending}
            aria-invalid={Boolean(state.fieldErrors.email)}
            className="h-11 rounded-xl transition-all duration-200 ease-out"
          />
          {state.fieldErrors.email ? <FieldError>{state.fieldErrors.email}</FieldError> : null}
        </Field>

        <Field data-invalid={Boolean(state.fieldErrors.password)}>
          <FieldLabel htmlFor="password">Passwort</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={passwordAutoComplete}
            placeholder="••••••••"
            required
            disabled={isPending}
            aria-invalid={Boolean(state.fieldErrors.password)}
            aria-describedby={passwordHint ? "password-hint" : undefined}
            className="h-11 rounded-xl transition-all duration-200 ease-out"
          />
          {state.fieldErrors.password ? (
            <FieldError>{state.fieldErrors.password}</FieldError>
          ) : passwordHint ? (
            <p id="password-hint" className="text-muted-foreground text-sm">
              {passwordHint}
            </p>
          ) : null}
        </Field>
      </FieldGroup>

      {state.formError ? (
        <p
          role="alert"
          aria-live="polite"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
        >
          {state.formError}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-xl text-sm font-medium shadow-lg transition-all duration-200 ease-out hover:shadow-xl disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            {pendingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
