# Implementierungsplan — Linktree-Clone

## Projektbeschreibung

Eine Link-in-Bio-App im Stil von Linktree bzw. Bento.me. Nutzer registrieren sich mit E-Mail und Passwort, wählen einen Username und erhalten darunter eine öffentliche Seite (`/u/<username>`), auf der ihre Links in selbst bestimmter Reihenfolge stehen. Angepasst wird bewusst nur eine einzige Sache: die Accent-Color.

Das Projekt ist ein Kurs-/Demo-Projekt für Einsteiger ins Agentic Coding. Der Scope ist deshalb absichtlich klein gehalten — die Lernkurve liegt im Arbeitsablauf (Spec → Build-Loop → Verifikation), nicht in der Feature-Menge.

**Stack:** Next.js (App Router) + React 19 + TypeScript strict · Tailwind CSS v4 + shadcn/ui + Framer Motion + Lucide · Supabase (PostgreSQL, Row Level Security, E-Mail/Passwort-Auth) · Deployment auf Vercel · Package Manager npm.

**Im MVP drin:** E-Mail+Passwort-Auth · eine öffentliche Seite pro User · Link-CRUD mit Drag-and-Drop-Reordering · eine wählbare Accent-Color · Profil-Section (Display-Name, Bio, Avatar-URL).

**Bewusst draußen:** OAuth · mehrere Pages pro User · Avatar-Upload via Storage · Click-Analytics jeglicher Art · fortgeschrittenes Theming · Embed-Link-Typen · Custom Domains · Paid Plans · Mehrsprachigkeit.

## Getroffene Entscheidungen

Die Grundsatzentscheidungen aus der Sparringssession stehen vollständig in `guidelines.md` (002–007). Kurzfassung, soweit sie die Arbeitspakete prägen:

| Thema | Entscheidung |
|---|---|
| URL der öffentlichen Seite | `/u/<username>` |
| Username-Vergabe | eigener `/onboarding`-Screen nach dem Sign-up, **nur** Username |
| User ohne Username | Forced Redirect auf `/onboarding` |
| Unbekannter Username | Claim-Seite statt 404 |
| Link-Typen | ausschließlich URLs |
| Editor | Split-View mit sticky Phone-Frame; auf Mobile Toggle statt Split |
| Accent-Color | 8 Presets + freier Picker; überschrieben wird `--brand`, **nicht** `--accent` |
| Drag-and-Drop | Framer Motion `Reorder` mit Drag-Handle (abweichend von der Discovery-Empfehlung) |
| Tastatur-Sortierung | Hoch/Runter-Buttons pro Karte |
| Empty-State | gestaltet mit CTA, keine vorbefüllten Beispieldaten |

## Arbeitspakete

| # | Feature | Spec | Abhängigkeiten | Status |
|---|---------|------|----------------|--------|
| 01 | Datenmodell vervollständigen (Username nullable, Sign-up-Trigger, Sortier-Funktion) | [`01-datenmodell-ergaenzungen.md`](specs/01-datenmodell-ergaenzungen.md) | — | ✅ |
| 02 | Auth mit E-Mail + Passwort (Clients, `proxy.ts`, Server Actions, Login/Sign-up) | [`02-auth-email-passwort.md`](specs/02-auth-email-passwort.md) | 01 | ✅ |
| 03 | Onboarding: Username wählen | [`03-onboarding-username.md`](specs/03-onboarding-username.md) | 01, 02 | ✅ |
| 04 | Dashboard-Shell (Layout, Navigation, Split-View-Gerüst, Sign-out) | [`04-dashboard-shell.md`](specs/04-dashboard-shell.md) | 02, 03 | ✅ |
| 05 | Link-CRUD (anlegen, bearbeiten, löschen, aktivieren) | [`05-link-crud.md`](specs/05-link-crud.md) | 04 | ✅ |
| 06 | Sortierung per Drag-and-Drop + Tastatur | [`06-link-reordering.md`](specs/06-link-reordering.md) | 05 | ✅ |
| 07 | Profil-Section (Display-Name, Bio, Avatar-URL) | [`07-profil-section.md`](specs/07-profil-section.md) | 04 | ✅ |
| 08 | Öffentliche Profilseite `/u/<username>` + Claim-Seite | [`08-public-profile-page.md`](specs/08-public-profile-page.md) | 05, 07 | ✅ |
| 09 | Accent-Color: Auswahl, sichere Injektion, automatischer Kontrast | [`09-theming-accent-color.md`](specs/09-theming-accent-color.md) | 08 | ✅ |
| 10 | Deployment: Git, GitHub, Vercel | [`10-deployment.md`](specs/10-deployment.md) | 01–09 | ✅ |

**Zur Reihenfolge:** Die öffentliche Seite (08) wird **vor** dem Theming (09) gebaut und läuft zunächst mit der Standard-Akzentfarbe. So gibt es beim Theming bereits eine sichtbare Fläche, an der die Farbe wirkt — sonst baut man die Farblogik blind. Aus demselben Grund kommt die Live-Preview im Dashboard aus derselben Komponente wie die öffentliche Seite; sie entsteht in 08 und wird in 04 nur eingehängt.

**Erste Commits ab Paket 10** — bis dahin wird laut `CLAUDE.md` Kernprinzip 4 nichts committet.

## Status-Legende

| Symbol | Bedeutung |
|--------|-----------|
| ⏳ | offen — noch nicht begonnen |
| 🚧 | in Arbeit — Build-Loop läuft |
| ✅ | fertig — Akzeptanzkriterien abgehakt, Validation grün, Debrief geschrieben |

## Phasen-Fahrplan

| Phase | Inhalt | Status |
|-------|--------|--------|
| 0 | Projekt-Skeleton (Next.js-Init + Doku-Layer) | ✅ |
| — | Supabase-Setup + UI-Setup (manuelle Kurs-Subs) | ⏳ |
| 1 | Discovery — 4 parallele Research-Themen → `references/discovery.md` | ✅ |
| 2 | Sparringssession — Rückfragen in Runden, bis keine Annahme offen ist → `guidelines.md` 002–007 | ✅ |
| 3 | Live-Design-Exploration via browser-use → `references/design-analysis.md` | ✅ |
| 4 | Arbeitspaket-Tabelle oben befüllen + Feature-Specs in `specs/NN-<feature>.md` | ✅ |
| 5 | Build-Loops pro Spec: Plan → Build → Check | ⏳ |
