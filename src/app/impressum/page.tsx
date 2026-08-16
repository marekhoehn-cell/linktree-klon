import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum — Linktree-Clone",
  description: "Anbieterkennzeichnung nach § 5 DDG und § 18 Abs. 2 MStV.",
};

/**
 * Statische Pflichtseite. Alle Angaben sind **Demo-Daten** für dieses
 * Kursprojekt — vor einem echten Betrieb müssen sie vollständig ersetzt werden.
 *
 * Rechtsstand: § 5 DDG (löste im Mai 2024 § 5 TMG ab), § 18 Abs. 2 MStV für die
 * redaktionelle Verantwortung, § 36 VSBG für die Schlichtungserklärung.
 * Kein Hinweis auf die EU-Plattform zur Online-Streitbeilegung: sie wurde zum
 * 20. Juli 2025 eingestellt, der früher übliche Link geht ins Leere.
 */
export default function ImpressumPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring -ml-2 inline-flex w-fit items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Zur Startseite
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight">Impressum</h1>

        <p className="border-border/60 bg-muted/40 text-muted-foreground rounded-2xl border px-4 py-3 text-sm leading-relaxed">
          Hinweis: Diese Seite gehört zu einem Lernprojekt. Sämtliche Angaben sind frei erfundene
          Demo-Daten und benennen kein real existierendes Unternehmen.
        </p>
      </div>

      <div className="border-border/60 bg-card/70 flex flex-col gap-8 rounded-2xl border p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_28px_-16px_rgba(0,0,0,0.35)] sm:p-8">
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold tracking-tight">Angaben gemäß § 5 DDG</h2>
          <address className="text-muted-foreground text-sm leading-relaxed not-italic">
            Linktree-Clone GmbH
            <br />
            Musterstraße 12
            <br />
            10115 Berlin
            <br />
            Deutschland
          </address>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold tracking-tight">Vertreten durch</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Alexandra Musterfrau, Geschäftsführerin
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold tracking-tight">Kontakt</h2>
          <dl className="text-muted-foreground grid grid-cols-[6rem_1fr] gap-x-4 gap-y-1 text-sm leading-relaxed">
            <dt>Telefon</dt>
            <dd>+49 30 1234567-0</dd>
            <dt>Telefax</dt>
            <dd>+49 30 1234567-9</dd>
            <dt>E-Mail</dt>
            <dd>kontakt@linktree-clone.example</dd>
          </dl>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold tracking-tight">Registereintrag</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Eingetragen im Handelsregister
            <br />
            Registergericht: Amtsgericht Berlin-Charlottenburg
            <br />
            Registernummer: HRB 123456 B
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold tracking-tight">Umsatzsteuer-Identifikationsnummer</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE123456789
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold tracking-tight">
            Redaktionell verantwortlich gemäß § 18 Abs. 2 MStV
          </h2>
          <address className="text-muted-foreground text-sm leading-relaxed not-italic">
            Alexandra Musterfrau
            <br />
            Musterstraße 12
            <br />
            10115 Berlin
          </address>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold tracking-tight">Verbraucherstreitbeilegung</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen (§ 36 Abs. 1 Nr. 1 VSBG).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold tracking-tight">Haftung für Inhalte</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als
            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold tracking-tight">Haftung für Links</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Unser Angebot enthält von Nutzerinnen und Nutzern eingestellte Links zu externen
            Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für diese fremden Inhalte
            ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Bei Bekanntwerden
            von Rechtsverletzungen entfernen wir derartige Links umgehend.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold tracking-tight">Urheberrecht</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.
          </p>
        </section>
      </div>
    </main>
  );
}
