import Link from "next/link";

import { ProfileAvatar } from "@/components/profile/avatar";
import { LinkButton } from "@/components/profile/link-button";
import type { PublicLink } from "@/lib/supabase/public-profile";
import { onBrand, safeAccent } from "@/lib/theme";

type ProfileViewProps = {
  username: string;
  /** Leer heißt: Die Überschrift ist `@<username>` (`07-profil-section.md`). */
  displayName: string | null;
  bio: string | null;
  /** Bereits geprüfte `https://`-Adresse oder `null`. */
  avatarUrl: string | null;
  /** Roher Wert aus `profiles.accent_color` — wird hier geprüft, nicht vorher. */
  accentColor: string;
  links: PublicLink[];
  /**
   * `page` ist die öffentliche Seite: echte Links, keine Füllelemente.
   * `preview` ist die Dashboard-Vorschau: nichts navigiert weg, und eine leere
   * Liste zeigt angedeutete Karten statt einer nackten Fläche.
   */
  variant?: "page" | "preview";
};

/**
 * Die öffentliche Profilseite als Komponente — **einmal** gebaut, zweimal
 * verwendet: unter `/u/<username>` und im Telefon-Rahmen des Dashboards.
 *
 * Genau deshalb steht sie hier und nicht in der Route: Was die Vorschau zeigt,
 * ist keine Nachbildung der öffentlichen Seite, sondern dieselbe Komponente.
 * Ein Unterschied kann damit gar nicht erst entstehen.
 *
 * Server-Komponente ohne Interaktivität — die Seite lädt vollständig auch ohne
 * JavaScript (Akzeptanzkriterium).
 *
 * Der Container ist bei 480 px zentriert und bekommt bewusst **kein** eigenes
 * Desktop-Layout (`references/design-analysis.md` Abschnitt 1).
 */
export function ProfileView({
  username,
  displayName,
  bio,
  avatarUrl,
  accentColor,
  links,
  variant = "page",
}: ProfileViewProps) {
  const isPreview = variant === "preview";
  const heading = displayName ?? `@${username}`;

  // Der Torwächter steht hier, unmittelbar vor dem JSX — nicht beim Laden der
  // Daten. Damit gilt er für jeden Aufrufer, auch für künftige.
  const brand = safeAccent(accentColor);

  return (
    <div
      // Injektion ausschließlich als CSS-Variable auf dem obersten Element.
      // Ein `<style>`-Tag ist im Projekt verboten: Dort greift Reacts Escaping
      // nicht, und der `</style>`-Ausbruch wäre echtes Stored XSS
      // (`guidelines.md` 004). Weil das hier eine Server-Komponente ist, steht
      // die Farbe bereits im ausgelieferten HTML — es blitzt nichts auf.
      style={{ "--brand": brand, "--brand-foreground": onBrand(brand) } as React.CSSProperties}
      className="mx-auto flex min-h-full w-full max-w-[480px] flex-1 flex-col items-center gap-3 px-6 py-12 text-center"
    >
      <ProfileAvatar src={avatarUrl} displayName={displayName} username={username} />

      {/* `overflow-wrap: anywhere` statt `break-words`: Ein 60 Zeichen langer Name
          ohne Leerzeichen hat keine Wortgrenze und würde den Container sprengen. */}
      <h1 className="mt-2 max-w-full text-xl font-semibold tracking-tight [overflow-wrap:anywhere]">
        {heading}
      </h1>

      {/* Der Handle steht nur dann zusätzlich da, wenn er nicht schon die Überschrift ist. */}
      {displayName ? <p className="text-muted-foreground -mt-2 text-sm">@{username}</p> : null}

      {bio ? (
        <p className="text-muted-foreground max-w-[36ch] text-sm leading-relaxed whitespace-pre-line [overflow-wrap:anywhere]">
          {bio}
        </p>
      ) : null}

      {links.length > 0 ? (
        // 14 px Abstand — der bei Linktree gemessene Wert.
        <ul className="mt-6 flex w-full flex-col gap-3.5">
          {links.map((link) => (
            <li key={link.id}>
              <LinkButton title={link.title} href={isPreview ? null : link.url} />
            </li>
          ))}
        </ul>
      ) : isPreview ? (
        <>
          <div className="mt-6 flex w-full flex-col gap-3.5" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="border-border/50 from-muted/50 h-15 rounded-2xl border border-dashed bg-gradient-to-b to-transparent"
              />
            ))}
          </div>
          <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
            Deine Links erscheinen hier, sobald du den ersten angelegt hast.
          </p>
        </>
      ) : null}

      {/* Dezenter Fuß (`references/design-analysis.md` Abschnitt 4, Punkt 7).
          `mt-auto` schiebt ihn bei einem Profil ohne Links ans Seitenende, statt
          ihn direkt unter den Namen zu hängen. Bei voller Liste ändert es nichts.
          In der Vorschau bleibt er Text — dort soll nichts wegnavigieren. */}
      <div className="text-muted-foreground/80 mt-auto pt-12 text-xs">
        {isPreview ? (
          <span>Erstelle deine eigene Seite</span>
        ) : (
          <Link
            href="/signup"
            className="focus-visible:ring-ring hover:text-foreground rounded-sm underline underline-offset-4 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
          >
            Erstelle deine eigene Seite
          </Link>
        )}
      </div>
    </div>
  );
}
