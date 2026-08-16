"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateAccentColor } from "@/app/dashboard/profil/actions";
import { Button } from "@/components/ui/button";
import {
  ACCENT_SAVED_MESSAGE,
  GENERIC_PROFILE_ERROR,
} from "@/lib/profile-form-state";
import { ACCENT_PRESETS, isAccentColor, onBrand, safeAccent } from "@/lib/theme";
import { cn } from "@/lib/utils";

type AccentPickerProps = {
  /** Aktuell gewählte Farbe — liegt in `ProfileWorkspace`, damit die Vorschau mitläuft. */
  value: string;
  onChange: (value: string) => void;
  /** Was in der Datenbank steht. Weicht `value` davon ab, gibt es einen Hinweis. */
  savedValue: string;
};

/**
 * Auswahl der Akzentfarbe: acht Vorschläge plus freier Farbwähler.
 *
 * Beide Wege laufen durch dieselbe Prüfung wie der Server (`isAccentColor`) —
 * die hier ist Komfort, die dort ist der Schutz (`CLAUDE.md` Kernprinzip 2).
 *
 * Bewusst ein **eigener** Speichern-Schritt statt Speichern beim Klick: Die
 * Vorschau lädt zum Ausprobieren ein, und nicht jede durchgeklickte Farbe soll
 * eine Server-Runde und eine Cache-Invalidierung auslösen.
 */
export function AccentPicker({ value, onChange, savedValue }: AccentPickerProps) {
  const [saved, setSaved] = useState(() => safeAccent(savedValue));
  const [isPending, startTransition] = useTransition();

  const isDirty = value !== saved;

  function select(next: string) {
    // Ein ungültiger Wert wird verworfen statt korrigiert — sonst wanderte
    // stillschweigend eine andere Farbe in die Vorschau, als angeklickt wurde.
    if (!isAccentColor(next)) return;
    onChange(next.toLowerCase());
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const result = await updateAccentColor(value);
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
        setSaved(value);
        toast.success(ACCENT_SAVED_MESSAGE);
      } catch (error) {
        // Ist der Server nicht erreichbar, liefert der Aufruf kein Ergebnis,
        // sondern wirft. Ohne dieses `catch` bliebe der Fehler unsichtbar.
        console.error("Akzentfarbe konnte nicht gespeichert werden", error);
        toast.error(GENERIC_PROFILE_ERROR);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        role="group"
        aria-label="Farbvorschläge"
        className="flex flex-wrap gap-3"
      >
        {ACCENT_PRESETS.map((preset) => {
          const isSelected = preset.value === value;

          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => select(preset.value)}
              disabled={isPending}
              aria-pressed={isSelected}
              aria-label={preset.label}
              title={preset.label}
              // `size-11` sind 44 px — das WCAG-Minimum für Tap-Targets.
              style={{ backgroundColor: preset.value, color: onBrand(preset.value) }}
              className={cn(
                "focus-visible:ring-ring focus-visible:ring-offset-background border-brand-border relative size-11 rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_20px_-12px_rgba(0,0,0,0.4)]",
                "transition-[translate,box-shadow,outline-color] duration-200 ease-out",
                "hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_14px_28px_-14px_rgba(0,0,0,0.5)]",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                "disabled:pointer-events-none disabled:opacity-50",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                // Der Ring der Auswahl liegt außen und in einem Theme-Ton —
                // in der Farbe selbst wäre er auf blassen Werten unsichtbar.
                isSelected && "ring-foreground/70 ring-offset-background ring-2 ring-offset-2",
              )}
            >
              {isSelected ? (
                <Check className="absolute inset-0 m-auto size-5" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label
          htmlFor="accentColor"
          className="text-muted-foreground flex items-center gap-3 text-sm"
        >
          {/* Der Systemdialog des Browsers — der Weg zu jeder anderen Farbe.
              `h-11` hält ihn auf derselben Höhe wie die Vorschlagsfelder. */}
          <input
            id="accentColor"
            type="color"
            value={value}
            onChange={(event) => select(event.target.value)}
            disabled={isPending}
            className="border-border/60 focus-visible:ring-ring focus-visible:ring-offset-background h-11 w-16 cursor-pointer rounded-xl border bg-transparent p-1 transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          />
          Eigene Farbe
        </label>

        <span className="text-muted-foreground font-mono text-xs tabular-nums">{value}</span>

        <div className="ml-auto flex items-center gap-3">
          <p
            aria-live="polite"
            className={cn(
              "text-xs transition-opacity duration-200 ease-out",
              isDirty ? "text-muted-foreground opacity-100" : "opacity-0",
            )}
          >
            Noch nicht gespeichert
          </p>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="h-11 min-w-11 rounded-2xl px-5 text-sm font-medium shadow-lg transition-all duration-200 ease-out hover:shadow-xl disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                Wird gespeichert …
              </>
            ) : (
              "Farbe speichern"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
