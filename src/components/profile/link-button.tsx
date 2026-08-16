import { cn } from "@/lib/utils";

/**
 * Gemeinsame Optik beider Varianten. `min-h-15` sind 60 px — der in
 * `references/design-analysis.md` gemessene Korridor und deutlich über dem
 * WCAG-Minimum von 44 px für Tap-Targets.
 *
 * Layering statt flacher Fläche (`rules/design-system.md` Regel 2): Verlauf,
 * Rahmen und zwei gestapelte Schatten — nah/eng für die Kante, weit/weich für
 * die Tiefe. Die Vorbilder sind hier bewusst flach, wir sind es nicht.
 *
 * Die Fläche trägt die Nutzerfarbe (`bg-brand`). Der Verlauf ist bewusst ein
 * neutraler Lichtschein (`from-white/12`) und **nicht** aus der Farbe gemischt:
 * So bleibt `background-color` die einzige farbtragende Ebene, und
 * `hover:bg-brand-hover` wirkt sichtbar, statt unter einem Farbverlauf zu
 * verschwinden. Die Beschriftung nutzt `text-brand-foreground` — den in
 * `src/lib/theme.ts` automatisch bestimmten Gegenpol.
 *
 * `rounded-xl` statt des Projekt-Defaults `rounded-2xl` — begründete Ausnahme
 * von Regel 6: In diesem Theme ist `--radius-2xl` 36 px, also mehr als die
 * halbe Kartenhöhe. Der Browser skaliert die Radien dann herunter und die Karte
 * wird zur verzogenen Kapsel. `rounded-xl` sind 24 px und liegen näher an den
 * 16 px aus der Design-Analyse.
 */
const LINK_BUTTON_CLASSES =
  // `bg-linear-to-b` statt `bg-gradient-to-b`: Der v3-Name wird von
  // `tailwind-merge` als *Hintergrundfarbe* eingestuft und verdrängt in `cn()`
  // stillschweigend das vorangehende `bg-brand` — die Karte bliebe farblos.
  "border-brand-border bg-brand text-brand-foreground from-white/12 flex min-h-15 w-full items-center justify-center rounded-xl border bg-linear-to-b to-transparent px-5 py-3 text-center text-[0.9375rem] leading-snug font-medium [overflow-wrap:anywhere] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_28px_-14px_rgba(0,0,0,0.35)]";

type LinkButtonProps = {
  title: string;
  /**
   * Geprüfte Zieladresse — oder `null` für die Dashboard-Vorschau, die zwar
   * gleich aussieht, aber nicht wegnavigieren darf.
   */
  href: string | null;
};

/**
 * Eine Link-Karte der öffentlichen Seite.
 *
 * Das `<a>` ist selbst die Karte, nicht ein Text darin — damit ist die gesamte
 * Fläche klickbar (Akzeptanzkriterium), ohne verschachtelte Klickflächen.
 *
 * `rel="noopener noreferrer"` bei `target="_blank"`: `noopener` verhindert, dass
 * die Zielseite über `window.opener` auf unsere Seite zugreift, `noreferrer`
 * unterdrückt zusätzlich den Referrer.
 */
export function LinkButton({ title, href }: LinkButtonProps) {
  if (href === null) {
    return (
      <div className={LINK_BUTTON_CLASSES} aria-hidden="true">
        {title}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        LINK_BUTTON_CLASSES,
        // 180 ms ease-out aus `references/design-analysis.md` Abschnitt 6.
        // `translate` statt `transform`: Tailwind v4 setzt `-translate-y-0.5` auf
        // die eigenständige `translate`-Property. Stünde hier `transform`, liefe
        // die Bewegung ohne Übergang — ein harter Sprung beim Überfahren.
        // Der Focus-Ring bleibt bewusst der neutrale Theme-Token: Ein Ring in
        // der Nutzerfarbe wäre bei einer blassen Wahl (etwa `#ffffff`) auf dem
        // Seitenhintergrund kaum noch zu sehen.
        "focus-visible:ring-ring focus-visible:ring-offset-background transition-[translate,box-shadow,border-color,background-color] duration-[180ms] ease-out",
        "hover:bg-brand-hover hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_18px_36px_-16px_rgba(0,0,0,0.45)]",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "active:translate-y-0 active:shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
        // Wer Bewegung reduziert haben will, bekommt Hover ohne Verschiebung.
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      {title}
    </a>
  );
}
