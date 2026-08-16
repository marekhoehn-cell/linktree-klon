# References — Research und Design-Grundlagen

Dieser Ordner sammelt alles, was **vor** dem Bauen recherchiert wird: technische Findings
und visuelle Referenzen. Er ist Input für die Specs in `specs/`, kein Code.

## Inhalt

### `discovery.md` — entsteht in Phase 1

Konsolidierte Research-Findings. Kein Rohmaterial, sondern die verdichteten Entscheidungen
mit Quellenangabe. Abgedeckte Themen:

- **UX-Patterns bei Linktree-Alternativen** — wie Onboarding, Link-Verwaltung, Vorschau und
  Profil-Sharing bei Linktree, Bento.me, Beacons und Co. gelöst sind; welche Muster sich
  wiederholen (und damit Nutzererwartung sind).
- **Supabase Email+Passwort-Auth in Next.js 15 App Router** — `@supabase/ssr`,
  Server Client vs. Browser Client, Middleware für Session-Refresh, Cookie-Handling,
  `getUser()` statt `getSession()` auf dem Server, RLS-Policies je Tabelle.
- **Theming-Patterns für user-customizable Pages** — wie Nutzer-Themes (Farben, Fonts,
  Hintergründe, Button-Stile) gespeichert und gerendert werden: CSS-Variablen vs.
  Tailwind-v4-Tokens, Server-seitiges Injizieren, Vermeidung von Flash of Unstyled Content.
- **Drag-and-Drop-Libraries für React 19** — Kandidaten (`dnd-kit`, `react-aria` Drag&Drop,
  Alternativen), Kompatibilität mit React 19 und dem App Router, Touch-Support,
  Accessibility, Bundle-Größe.

### `design-analysis.md` — entsteht in Phase 3

Ergebnis der **Live-Exploration** echter Seiten mit `browser-use --headed`: Linktree.com,
Bento.me, Beacons sowie reale Nutzerprofile auf diesen Plattformen. Festgehalten wird, was
tatsächlich im DOM/Rendering zu sehen ist, nicht was in Marketing-Texten behauptet wird:

- **Farbpaletten** — konkrete Hex-Werte, Kontrastverhältnisse, Dark/Light-Behandlung
- **Typography** — Fontfamilien, Größenskala, Line-Height, Font-Weights
- **Spacing** — Grid- und Abstandsskala, Container-Breiten, Touch-Target-Größen
- **Motion** — Übergänge, Dauer, Easing, Hover- und Tap-Feedback
- **Layout** — Aufbau der Public Page und des Dashboards, Breakpoints, Card-Strukturen

### `inspiration/`

Statische Referenz-Screenshots: Seiten, Sektionen und Details, an denen sich das Projekt
orientieren soll. Dateinamen sprechend halten, z. B.
`bento-me-profile-grid.png`, `linktree-dashboard-linkliste.png`.

### `anti-inspiration/`

Gegenbeispiele: Screenshots von Lösungen, die bewusst **nicht** nachgebaut werden —
überladene Profile, schlechte Kontraste, zu viel Motion, unklare CTAs. Ebenso wichtig wie
die Inspiration, weil sie die Grenzen des Designs definiert.

## Aktueller Stand

Stand 15.08.2026: `discovery.md` (Phase 1) und `design-analysis.md` (Phase 3) sind fertig.
`inspiration/` enthält fünf Referenz-Screenshots von Linktree, Bento.me und Beacons, die in
`design-analysis.md` ausgewertet sind. `anti-inspiration/` ist weiterhin leer und nur per
`.gitkeep` in Git gehalten — es kam im Projektverlauf kein Gegenbeispiel dazu.
