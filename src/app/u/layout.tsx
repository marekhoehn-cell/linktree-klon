/**
 * Gemeinsamer Grund für den gesamten Profil-Namespace: Profilseite, Claim-Seite
 * und die 404 stehen alle auf derselben Fläche.
 *
 * Der Schein liegt bewusst **hinter** dem Inhalt und läuft seitlich über den
 * Rand hinaus: Ein abgeschnittener Verlauf zeigt sonst eine sichtbare Kante,
 * und genau das ist die flache Fläche, die `rules/design-system.md` Regel 2
 * verbietet.
 */
export default function ProfileNamespaceLayout({ children }: LayoutProps<"/u">) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="from-primary/12 via-primary/4 pointer-events-none absolute -inset-x-1/4 -top-40 h-[38rem] rounded-[50%] bg-linear-to-b to-transparent"
      />
      <div className="relative flex flex-1 flex-col">{children}</div>
    </div>
  );
}
