"use client";

import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { checkUsernameAvailability, claimUsername } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PUBLIC_PROFILE_HOST, normalizeUsername, validateUsername } from "@/lib/username";
import {
  EMPTY_USERNAME_FORM_STATE,
  type UsernameCheckResult,
} from "@/lib/username-form-state";

/** Wartezeit nach dem letzten Tastendruck, bevor der Server gefragt wird. */
const DEBOUNCE_MS = 400;

/**
 * `initialUsername` kommt von der Claim-Seite über die Registrierung. Er ist
 * bereits serverseitig geprüft und dient nur als Startwert — ab dem ersten
 * Tastendruck gilt wieder ausschließlich die Eingabe des Nutzers.
 */
export function UsernameForm({ initialUsername = "" }: { initialUsername?: string }) {
  const [state, formAction, isPending] = useActionState(claimUsername, EMPTY_USERNAME_FORM_STATE);
  const [username, setUsername] = useState(initialUsername);
  /** Antwort des Servers samt der Eingabe, zu der sie gehört — verspätete Antworten laufen so ins Leere. */
  const [serverCheck, setServerCheck] = useState<{
    value: string;
    result: UsernameCheckResult;
  } | null>(null);

  // Lokale Prüfung beim Rendern statt im State: der Server wird nur für gültige Namen befragt.
  const validation = username.length > 0 ? validateUsername(username) : null;
  const isLocallyValid = validation?.ok === true;

  useEffect(() => {
    if (!isLocallyValid) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      void checkUsernameAvailability(username).then((result) => {
        if (cancelled) return;
        setServerCheck({ value: username, result });
      });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username, isLocallyValid]);

  const check: UsernameCheckResult | null =
    validation === null
      ? null
      : validation.ok
        ? (serverCheck?.value === username ? serverCheck.result : null)
        : { status: "invalid", message: validation.message };

  const isChecking = isLocallyValid && check === null;
  /** Rot markiert wird beides — gesperrt nur, was lokal eindeutig falsch ist. */
  const isBlocked = check?.status === "invalid" || check?.status === "taken";
  /**
   * „Vergeben" sperrt den Button bewusst nicht: Zwischen Prüfung und Absenden
   * kann sich der Stand ändern, die verbindliche Antwort gibt erst der Server.
   */
  const isSubmitDisabled = isPending || check?.status === "invalid";
  const previewName = username.length > 0 ? username : "dein-name";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Field data-invalid={isBlocked}>
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <Input
          id="username"
          name="username"
          value={username}
          onChange={(event) => setUsername(normalizeUsername(event.target.value))}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="maxmuster"
          required
          disabled={isPending}
          aria-invalid={isBlocked}
          aria-describedby="username-preview username-status"
          className="h-11 rounded-xl transition-all duration-200 ease-out"
        />

        <p id="username-preview" className="text-muted-foreground font-mono text-xs">
          {PUBLIC_PROFILE_HOST}/u/
          <span className="text-foreground">{previewName}</span>
        </p>

        <div id="username-status" aria-live="polite" className="min-h-5">
          {isChecking ? (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
              Wird geprüft …
            </p>
          ) : check?.status === "available" ? (
            <p className="text-primary flex items-center gap-1.5 text-sm font-medium">
              <Check className="size-3.5" aria-hidden="true" />
              Dieser Name ist frei.
            </p>
          ) : check?.status === "taken" || check?.status === "invalid" ? (
            <FieldError>{check.message}</FieldError>
          ) : check?.status === "error" ? (
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <CircleAlert className="size-3.5" aria-hidden="true" />
              {check.message}
            </p>
          ) : null}
        </div>
      </Field>

      {state.error ? (
        <p
          role="alert"
          aria-live="polite"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
        >
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        className="h-11 w-full rounded-xl text-sm font-medium shadow-lg transition-all duration-200 ease-out hover:shadow-xl disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Name wird gesichert …
          </>
        ) : (
          "Namen sichern"
        )}
      </Button>
    </form>
  );
}
