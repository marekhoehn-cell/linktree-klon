/**
 * Die einzige Stelle im Projekt, an der ein Farbwert geprüft und in eine
 * Textfarbe übersetzt wird (`guidelines.md` 004).
 *
 * Projektregel: **Kein Farbwert erreicht JSX, ohne durch `safeAccent()` gegangen
 * zu sein.** Geprüft wird an drei Stellen — Formular, Server Action, Rendering.
 */

/** Entspricht dem Datenbank-Default von `profiles.accent_color`. */
export const DEFAULT_ACCENT = "#6366f1";

/**
 * Erlaubt ist ausschließlich sechsstelliges Hex mit `#`. Keine Kurzform, kein
 * `rgb()`, keine Farbnamen — und vor allem **kein Semikolon**.
 *
 * Das ist kein Formalismus: React escapt im Server-Rendering keine Semikolons.
 * Ein Wert wie `red;position:fixed;inset:0` erzeugte sonst zusätzliche
 * CSS-Deklarationen im selben `style`-Attribut. Der Regex schließt das per
 * Konstruktion aus.
 */
const ACCENT_RE = /^#[0-9a-f]{6}$/i;

export function isAccentColor(value: unknown): value is string {
  return typeof value === "string" && ACCENT_RE.test(value);
}

/**
 * Torwächter. Gibt bei allem, was nicht exakt dem Muster entspricht, den
 * Standardwert zurück — und **wirft nie**: Ein per SQL an der Anwendung vorbei
 * gesetzter Unsinnswert darf die öffentliche Seite nicht in eine Fehlerseite
 * kippen (`specs/09-theming-accent-color.md`).
 */
export function safeAccent(value: unknown): string {
  return isAccentColor(value) ? value : DEFAULT_ACCENT;
}

/** Ein Kanal (0…255) linearisiert nach WCAG 2.x. */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * Relative Luminanz nach WCAG 2.x, 0 (schwarz) bis 1 (weiß).
 *
 * Erwartet einen bereits durch `safeAccent()` gelaufenen Wert; alles andere
 * ergibt 0 statt eines Fehlers.
 */
export function luminance(hex: string): number {
  if (!isAccentColor(hex)) return 0;

  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Der Punkt gleichen Kontrasts zu Schwarz und Weiß. Aus der WCAG-Formel:
 * `(L + 0.05) / 0.05 = 1.05 / (L + 0.05)` → `L = √0.0525 − 0.05`.
 * Am Gleichstand beträgt der Kontrast 4.58:1 — über der AA-Schwelle von 4.5:1.
 */
const CONTRAST_BREAKPOINT = 0.17913;

/**
 * Textfarbe auf einer Fläche in `hex` — dunkel auf hellen, hell auf dunklen
 * Farben. Damit erfüllt **jede** wählbare Akzentfarbe WCAG AA, ohne Warnung an
 * den Nutzer und ohne Dependency.
 *
 * Bewusste Ausnahme von `rules/design-system.md` Regel 3 (keine harten
 * `#000`/`#fff`): Mit abgestuften Neutrals (`#0a0a0b` / `#fafafa`) fällt der
 * Kontrast am Gleichstandspunkt auf 4.36:1 und unterschreitet AA. Die Regel
 * zielt auf Flächen und Neutrals des Layouts — hier zählt die Garantie über
 * jeder denkbaren Nutzerfarbe.
 */
export function onBrand(hex: string): string {
  return luminance(hex) > CONTRAST_BREAKPOINT ? "#000000" : "#ffffff";
}

export type AccentPreset = {
  value: string;
  label: string;
};

/**
 * Acht Vorschläge als schneller Weg zu einem guten Ergebnis. Sie laufen durch
 * dieselbe Prüfung wie der freie Farbwähler — Presets sind Komfort, nicht
 * Vertrauensbeweis.
 */
export const ACCENT_PRESETS: AccentPreset[] = [
  { value: DEFAULT_ACCENT, label: "Indigo" },
  { value: "#8b5cf6", label: "Violett" },
  { value: "#ec4899", label: "Pink" },
  { value: "#ef4444", label: "Rot" },
  { value: "#f97316", label: "Orange" },
  { value: "#f59e0b", label: "Bernstein" },
  { value: "#10b981", label: "Smaragd" },
  { value: "#0ea5e9", label: "Himmelblau" },
];
