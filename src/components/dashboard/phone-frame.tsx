/**
 * Telefon-Rahmen für die Live-Vorschau.
 *
 * Innenbreite ~390 px (`references/design-analysis.md`), damit der Inhalt
 * exakt so bricht wie auf einem echten Gerät. Der Rahmen selbst ist reine
 * Deko und für Screenreader unsichtbar — der Inhalt bleibt lesbar.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border from-card to-card/70 shadow-lg relative w-[414px] max-w-full rounded-[2.5rem] border bg-linear-to-b p-3">
      {/*
        Zweite Schattenebene: weit und weich, erzeugt Tiefe statt Kastenrand.
        Das `-z-10` ist hier — anders als in `auth-shell.tsx` — richtig: Der Schein
        sitzt mit `-bottom-6` außerhalb des Rahmens und bleibt dort sichtbar, hinter
        dem Rahmen verdeckt zu sein ist genau der gewünschte Effekt.
      */}
      <div
        aria-hidden="true"
        className="bg-primary/10 pointer-events-none absolute inset-x-8 -bottom-6 -z-10 h-24 rounded-full blur-2xl"
      />
      <div className="bg-background border-border/60 relative overflow-hidden rounded-[2rem] border">
        {/* Notch-Andeutung — hält den Rahmen erkennbar, ohne ein Gerät zu imitieren. */}
        <div
          aria-hidden="true"
          className="bg-border/80 absolute top-2.5 left-1/2 h-1.5 w-16 -translate-x-1/2 rounded-full"
        />
        <div className="h-[620px] max-h-[68vh] overflow-y-auto overscroll-contain pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
