import Link from "next/link";

/**
 * Globale Fußzeile — hängt im Root-Layout und ist damit auf jeder Route
 * erreichbar (Startseite, Auth, Dashboard, öffentliche Profilseiten).
 *
 * Bewusst minimal: Auf der Profilseite ist der Inhalt der Star, die Fußzeile
 * darf dort nur die Pflichtangabe tragen und sonst nicht auffallen. Deshalb
 * `mt-auto` statt eigener Fläche — sie sitzt am unteren Rand, ohne den
 * Seitenaufbau zu verändern.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/50 bg-card/30 mt-auto border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row sm:px-6">
        <p>© {year} Linktree-Clone</p>

        <nav aria-label="Rechtliches">
          <Link
            href="/impressum"
            className="hover:text-foreground focus-visible:ring-ring rounded-lg px-2 py-1 font-medium transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
          >
            Impressum
          </Link>
        </nav>
      </div>
    </footer>
  );
}
