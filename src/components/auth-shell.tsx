import Link from "next/link";

/** Gemeinsame Bühne für Login, Sign-up und Onboarding — eine zentrierte Karte auf weichem Verlauf. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-background via-background to-muted/40 relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-linear-to-b px-4 py-16">
      {/*
        Weicher Lichtschein hinter der Karte — sorgt für Layering statt flacher Fläche.
        Kein negatives `z-index`: Der Container malt seinen eigenen Verlauf über jedes
        Kind mit `-z-*`, der Schein wäre schlicht unsichtbar. Stattdessen liegt er auf
        Ebene 0 und Kopfzeile/Karte darüber auf `relative` — dasselbe Muster wie in
        `landing-hero.tsx`. `overflow-hidden` ist Pflicht, sonst ragt der Schein auf
        schmalen Bildschirmen über den Rand und erzeugt eine horizontale Scrollleiste.
      */}
      <div
        aria-hidden="true"
        className="bg-primary/10 pointer-events-none absolute top-1/4 left-1/2 size-[28rem] -translate-x-1/2 rounded-full blur-3xl"
      />
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring relative mb-8 rounded-lg px-2 py-1 text-sm font-medium tracking-tight transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
      >
        Linktree-Clone
      </Link>
      <div className="relative flex w-full flex-col items-center">{children}</div>
    </div>
  );
}
