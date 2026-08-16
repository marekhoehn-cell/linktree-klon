# Linktree-Clone

Eine Link-in-Bio-App im Stil von Linktree oder Bento.me — gebaut als Kurs-/Demo-Projekt für den Einstieg ins Agentic Coding.

User registrieren sich mit Email und Passwort, pflegen ein kleines Profil (Display-Name, Bio, Avatar-URL), verwalten ihre Links per Drag-and-Drop und wählen eine Accent-Color. Das Ergebnis ist eine öffentliche Seite unter `/u/<username>`, die jeder ohne Login aufrufen kann.

## Tech-Stack

- **Next.js 15+/16**, App Router
- **React 19**
- **TypeScript**, `strict: true`
- **Tailwind CSS v4**
- **shadcn/ui** — Komponenten-Basis
- **Framer Motion** — Animationen, Drag-and-Drop-Feedback
- **Lucide Icons**
- **Backend: Next.js Server Actions / API Routes** — kein separater Backend-Service
- **Supabase** — Postgres, Row Level Security, Email/Passwort-Auth (kein OAuth, kein Magic Link)
- **Deployment: Vercel**
- **Paketmanager: npm**

Code liegt unter `src/`, der Doku-Layer im Projekt-Root.

## MVP-Scope

**Drin:**
- Email+Passwort-Auth (Registrierung, Login, Logout)
- Eine öffentliche Landing-Page pro User unter `/u/<username>`
- Link-CRUD (anlegen, bearbeiten, löschen) mit Drag-and-Drop-Reordering
- Eine user-wählbare Accent-Color
- Profil-Section: Display-Name, Bio, Avatar-URL

**Bewusst draußen:**
- OAuth-Provider (Google, GitHub, …)
- Mehrere Pages pro User
- Avatar-Upload via Supabase Storage — das URL-Feld reicht
- Jegliche Click-Analytics
- Fortgeschrittenes Theming (Fonts, Backgrounds, Layout-Varianten)
- Embed-Link-Typen (Spotify, YouTube, …)
- Custom Domains
- Monetarisierung
- Mehrsprachigkeit

Diese Liste ist bindend. Neue Ideen landen in `backlog.md`, nicht im Code.

## Quickstart

```bash
npm install
npm run dev
```

App läuft auf http://localhost:3000.

Vorher `.env.local` im Projekt-Root anlegen:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<dein-projekt>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dein-anon-bzw-publishable-key>
```

Beide Werte stehen im Supabase-Dashboard unter *Project Settings → API*. Neuere Projekte zeigen den Anon-Key als **Publishable Key** — inhaltlich derselbe öffentliche Schlüssel. `.env.local` ist über `.gitignore` ausgeschlossen und gehört nie ins Repo.

## Doku-Landkarte

| Datei / Ordner | Inhalt |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | Router für den Agenten: Kommunikation, welche Rule wann gilt, Kernprinzipien |
| [rules/](./rules/) | Verbindliche Arbeitsregeln: `design-system.md`, `code-conventions.md`, `verification.md`, `tech-stack.md` |
| [guidelines.md](./guidelines.md) | Architektur-Entscheidungen im ADR-Stil (Kontext / Entscheidung / Warum / Alternativen) |
| [implementierungsplan.md](./implementierungsplan.md) | Der Bauplan: Arbeitspakete in Reihenfolge, mit Abhak-Status |
| [specs/](./specs/) | Feature-Specs — was genau gebaut wird, pro Arbeitspaket |
| [references/](./references/) | Referenzmaterial: Screenshots, Beispiel-Snippets, externe Vorlagen |
| [backlog.md](./backlog.md) | Ideen-Parkplatz für alles außerhalb des MVP-Scopes |
| [changelog.md](./changelog.md) | Chronologisches Protokoll aller Änderungen |
| [learning.md](./learning.md) | Debriefs: was schiefging, was daraus folgt |
