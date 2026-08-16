# CLAUDE.md — Router

## Kommunikation
- Immer **Deutsch**. Stil: respektvoll, pragmatisch, lösungsorientiert (RPL).
- Der Mitbauende ist **Einsteiger ins Agentic Coding**: vor jeder Ausführung in 1–2 Sätzen erklären, was du gleich tust und warum.
- Keine Platzhalter-Prosa, keine erfundenen Dateien oder Werte — konkret bleiben.

## Projekt
Linktree-Clone: Link-in-Bio-App, bei der sich User per Email+Passwort registrieren, ihre Links per Drag-and-Drop sortieren und unter `/u/<username>` eine öffentliche Seite mit eigener Accent-Color bekommen.

## Wann welche Rule lesen

| Auslöser | Datei |
|---|---|
| Bei **jeder UI-Arbeit** (Komponenten, Layout, Farben, Spacing, Motion) | `rules/design-system.md` |
| Bei **jedem Code-Schreiben** (Struktur, Naming, Types, Server Actions) | `rules/code-conventions.md` |
| **Nach jedem Arbeitspaket**, vor dem Abhaken | `rules/verification.md` |
| Bei **Commands, Tooling, Setup, Dependencies, Deployment** | `rules/tech-stack.md` |

Rules werden gelesen, wenn der Auslöser eintritt — nicht vorsorglich alle auf einmal.

## Tools
- **Supabase MCP** (full-access): Schema, Migrations, RLS-Policies, SQL, Logs, Advisors. Kein manuelles Klicken im Dashboard, wenn das MCP es kann.
- **Context7 MCP**: aktuelle Doku. **Pflicht bei Supabase-Auth-Patterns** (`@supabase/ssr`, Cookies, Middleware, Session-Handling) und bei Next.js-15/16-Spezifika — dort nie aus dem Gedächtnis arbeiten, die APIs haben sich geändert.
- **browser-use `--headed`**: Visual Verification. UI-Arbeitspakete gelten erst als fertig, wenn sie im echten Browser gesehen wurden.
- **Next.js 16**: bei API-Fragen die mitgelieferte Doku unter `node_modules/next/dist/docs/` lesen — Next 16 weicht an vielen Stellen von älterem Wissen ab. (`AGENTS.md` enthält nur diesen Hinweis und verweist zurück auf diese Datei.)

## Kernprinzipien
1. **Scope halten.** Die „draußen"-Liste in `README.md` ist bindend: kein OAuth, keine Analytics, kein Storage-Upload, keine Custom Domains, kein erweitertes Theming. Ideen wandern nach `backlog.md`, nicht in den Code.
2. **User-Input ist unsicher.** Accent-Color wird als Hex validiert — **client UND server** (Server Action prüft erneut, Regex `^#[0-9a-fA-F]{6}$`). Nie ungeprüfte Werte in `style`/CSS schreiben.
3. **RLS auf jeder Tabelle.** Neue Tabelle ohne aktivierte Row Level Security und passende Policies gilt als unfertig. Nach Schema-Änderungen `get_advisors` laufen lassen.
4. **Keine Commits bis Sub 5.13.7.** Vorher wird nichts committet oder gepusht — auch nicht „nur schnell zwischendurch".
