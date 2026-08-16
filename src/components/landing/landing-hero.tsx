import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PUBLIC_PROFILE_HOST } from "@/lib/username";

/**
 * Startseite für Besucher ohne Session — ein Screen, ein Ziel.
 *
 * Bühne und Lichtschein sind bewusst dieselben wie in `auth-shell.tsx`: Wer hier
 * auf „Kostenlos starten" klickt, landet direkt auf `/signup` und soll dort
 * keinen Bruch im Erscheinungsbild sehen. Server-Komponente, kein State —
 * Hover und Focus laufen vollständig über CSS.
 */
export function LandingHero() {
  return (
    <div className="from-background via-background to-muted/50 relative flex flex-1 flex-col overflow-hidden bg-gradient-to-b">
      {/*
        Zwei weiche Lichtscheine erzeugen die Tiefe (Design-Regel 2).
        Kein negatives `z-index`: Der Container malt seinen eigenen Verlauf über
        jedes Kind mit `-z-*`, der Schein wäre schlicht unsichtbar. Stattdessen
        liegen die Scheine auf Ebene 0 und Kopfzeile/Hero darüber auf `relative`.
        `overflow-hidden` ist Pflicht — sonst ragt der Schein bei 390 px über den
        rechten Rand hinaus und erzeugt eine horizontale Scrollleiste.
      */}
      <div
        aria-hidden="true"
        className="bg-primary/25 pointer-events-none absolute -top-40 left-1/2 size-[40rem] -translate-x-1/2 rounded-full blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="bg-primary/10 pointer-events-none absolute -right-32 -bottom-40 size-[28rem] rounded-full blur-[110px]"
      />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        {/* Kein Link: Wir sind bereits auf „/". */}
        <span className="text-foreground text-sm font-medium tracking-tight">Linktree-Clone</span>

        <Link
          href="/login"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
        >
          Anmelden
        </Link>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
          <span className="border-border/60 bg-card/70 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Ein Link für alles
          </span>

          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Alle deine Links. Eine Adresse.
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed text-pretty sm:text-lg">
              Sammle deine wichtigsten Links auf einer Seite, sortiere sie per Drag-and-drop und
              gib sie mit einer einzigen Adresse weiter.
            </p>
          </div>

          {/*
            Zeigt in einer Zeile, was am Ende dabei herauskommt. Bewusst dezenter
            als in `claim-page.tsx`: Dort ist die Adresse das Angebot, hier steht
            sie direkt über dem CTA und darf ihm nicht die Aufmerksamkeit nehmen.
          */}
          <p className="border-border/60 bg-card/50 text-muted-foreground rounded-full border px-4 py-2 font-mono text-xs break-all shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            {PUBLIC_PROFILE_HOST}/u/<span className="text-foreground">deinname</span>
          </p>

          <Button
            asChild
            className="h-11 w-full max-w-sm gap-2 rounded-2xl text-sm font-medium shadow-lg transition-all duration-200 ease-out hover:shadow-xl"
          >
            <Link href="/signup">
              Kostenlos starten
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
