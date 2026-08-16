# Tech-Stack & Commands

## Commands

| Command | Zweck |
|---|---|
| `npm run dev` | Dev-Server starten (http://localhost:3000) |
| `npm run build` | Production-Build — muss vor jedem Deployment grün sein |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript-Prüfung ohne Ausgabe von Dateien |
| `npx shadcn@latest add <component>` | shadcn/ui-Komponente ins Projekt kopieren, z. B. `button`, `card`, `input` |
| `browser-use --headed` | Browser sichtbar steuern — für den Visual Verification Loop |

**Hinweis:** Das Script `typecheck` muss in `package.json` noch ergänzt werden:

```json
"scripts": {
  "typecheck": "tsc --noEmit"
}
```

## Types generieren

Nach **jeder** Schema-Änderung neu generieren — sonst laufen Code und DB auseinander.

1. **Bevorzugt:** Supabase-MCP-Tool `generate_typescript_types`, Ergebnis nach `src/lib/database.types.ts` schreiben.
2. **Fallback (CLI):**

```bash
npx supabase gen types typescript --project-id lrbowvhaochqbtidchsc --schema public > src/lib/database.types.ts
```

`database.types.ts` ist eine **generierte** Datei — niemals von Hand bearbeiten.

## MCPs

| MCP | Modus | Wofür |
|---|---|---|
| **Supabase MCP** | full-access | Schema anlegen/ändern (`apply_migration`), Tabellen prüfen (`list_tables`), Sicherheits-Check (`get_advisors`), SQL ausführen, Types generieren |
| **Context7 MCP** | — | Aktuelle Library-Doku (Next.js, Supabase, Tailwind, shadcn) |

Projekt-Daten:
- `project_ref`: `lrbowvhaochqbtidchsc`
- API-URL: `https://lrbowvhaochqbtidchsc.supabase.co`

**Pflichtregel:** Bei Supabase-Auth-Patterns (`@supabase/ssr`, Cookie-Handling, Server-/Browser-Client, Middleware) **immer zuerst Context7 fragen** — nicht aus dem Gedächtnis schreiben. Diese APIs haben sich mehrfach geändert; veraltete Patterns (z. B. `auth-helpers`) sehen plausibel aus und funktionieren nicht.

## Stack

| Bereich | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI-Library | React 19 |
| Sprache | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Komponenten | shadcn/ui |
| Animation | Framer Motion — Paket `motion@13.1.0`, Import aus `motion/react` |
| Icons | Lucide |
| Backend/DB | Supabase (Postgres + RLS, Email+Passwort-Auth) |
| Deployment | Vercel |
| Package Manager | npm |

## Ordner-Struktur

| Ordner | Inhalt |
|---|---|
| `src/app/` | Routen (App Router), Layouts, Server Actions, `globals.css` |
| `src/components/` | UI-Komponenten (shadcn unter `src/components/ui/`) |
| `src/lib/` | Utilities, Supabase-Clients, `database.types.ts` |
| `specs/` | Arbeitspaket-Specs mit Akzeptanzkriterien |
| `rules/` | Diese Regeldateien |
| `references/` | Referenzmaterial (Screenshots, Vorbilder, Notizen) |

## Free-Tier-Rahmen

Das Projekt läuft vollständig kostenlos, **ohne Kreditkarte**.

| Anbieter | Grenzen |
|---|---|
| Supabase Free | 500 MB Datenbank, 50.000 monatlich aktive Nutzer (MAU), 5 GB Bandbreite |
| Vercel Hobby | Persönliche/nicht-kommerzielle Nutzung, ausreichend für Deploy + Preview-Builds |

Hinweis: Supabase-Free-Projekte werden nach längerer Inaktivität pausiert und müssen im Dashboard wieder gestartet werden.
