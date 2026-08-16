# 01 — Datenmodell vervollständigen

## Ziel
Nach diesem Paket entsteht beim Sign-up automatisch ein Profil-Datensatz, ein User darf zunächst **ohne** Username existieren, und die Reihenfolge der Links lässt sich in einem einzigen, sicheren Datenbankaufruf speichern. Für den Nutzer ist davon nichts sichtbar — es ist das Fundament, ohne das die Pakete 02, 03 und 06 nicht funktionieren.

## Ausgangslage (bereits vorhanden, nicht neu bauen)
Aus dem Supabase-Setup existieren bereits:
- Tabelle `public.profiles` — `id` (FK auf `auth.users`), `username` (unique, `check ~ '^[a-z0-9_-]{3,30}$'`), `display_name` (≤ 60), `bio` (≤ 300), `avatar_url` (nur `https://`), `accent_color` (default `#6366f1`, `check ~* '^#[0-9a-f]{6}$'`), `created_at`, `updated_at`
- Tabelle `public.links` — `id`, `user_id` (FK), `title` (1–80), `url` (nur `http(s)://`), **`sort_order`** (integer, not null, default 0), `is_active` (default true), Zeitstempel
- **RLS ist auf beiden Tabellen aktiviert**, Policies vollständig: `profiles_select_public`, `profiles_insert_own`, `profiles_update_own`, `profiles_delete_own`, `links_select_own`, `links_select_public_active`, `links_insert_own`, `links_update_own`, `links_delete_own`
- Funktion `public.set_updated_at()` mit `search_path=""` und Trigger auf beiden Tabellen

> Die Sortier-Spalte heißt **`sort_order`**, nicht `position`. In `references/discovery.md` steht durchgängig `position` — das war die Recherche-Empfehlung, der bestehende Name gilt.

## Abhängigkeiten
- Supabase-Projekt `lrbowvhaochqbtidchsc` erreichbar (Supabase MCP)
- Keine vorherige Spec

## Out of Scope
- Jede UI — Formulare und Seiten kommen in 02 und 03
- Storage/Buckets für Avatare (dauerhaft draußen, siehe `README.md`)
- Änderungen an bestehenden RLS-Policies, solange die Prüfung unten nichts Fehlendes zeigt

## Akzeptanzkriterien
- [x] `profiles.username` ist **nullable** — ein Profil kann ohne Username existieren
- [x] Der `unique`-Constraint auf `username` gilt weiterhin, mehrere Profile mit `NULL` sind gleichzeitig möglich
- [x] Nach einem Sign-up über die Supabase-API existiert automatisch genau eine Zeile in `profiles` mit passender `id` und `username = NULL`
- [x] Es wird **kein** Fallback-Username wie `user_a1b2c3` erzeugt
- [x] Wird ein Auth-User gelöscht, verschwinden sein Profil und alle seine Links (Cascade)
- [x] Die Funktion `public.reorder_links(uuid[])` existiert, setzt `sort_order` gemäß Array-Reihenfolge ab 0 und ändert **ausschließlich** Zeilen des aufrufenden Users
- [x] `mcp__supabase__get_advisors` meldet für Security keine neuen Warnungen außer der erwarteten „Leaked Password Protection disabled" (Pro-Plan-only) — Security-Lints sind sogar komplett leer
- [x] `src/lib/database.types.ts` ist erzeugt und `username` ist darin als `string | null` typisiert

## Tasks
- [x] Migration `username_nullable`: `alter table public.profiles alter column username drop not null;`
- [x] Prüfen, ob die FK-Constraints `on delete cascade` tragen; falls nicht, in derselben Migration nachziehen — **beide tragen es bereits**, nichts nachzuziehen
- [x] Migration `handle_new_user`: Funktion + Trigger `on_auth_user_created` auf `auth.users`
  - `security definer`, zwingend `set search_path = ''`, voll qualifizierte Namen
  - Fügt nur `id` ein — **kein** Username, **kein** generierter Fallback
  - `on conflict (id) do nothing`, damit ein erneuter Lauf nicht scheitert
- [x] Migration `reorder_links`: Funktion mit `security invoker`, `set search_path = ''`, `unnest(link_ids) with ordinality`, zusätzlicher Filter `user_id = (select auth.uid())`
- [x] `mcp__supabase__get_advisors` für `security` **und** `performance` laufen lassen, Befunde bewerten
- [x] TypeScript-Typen erzeugen (`mcp__supabase__generate_typescript_types`) und nach `src/lib/database.types.ts` schreiben

## Validation
- **Trigger:** Testuser über die Auth-API anlegen → `select id, username from public.profiles where id = '<neue-id>'` liefert genau eine Zeile mit `username IS NULL`
- **Nullable:** `insert` eines zweiten Profils ohne Username schlägt **nicht** fehl (zwei `NULL`-Werte sind erlaubt); ein zweites Profil mit *demselben* nicht-leeren Username schlägt fehl
- **Cascade:** Testuser löschen → `select count(*) from public.links where user_id = '<id>'` ergibt 0
- **`reorder_links` Positivfall:** Drei Links anlegen, IDs in umgekehrter Reihenfolge übergeben, danach `select id, sort_order from public.links order by sort_order` → Reihenfolge ist 0, 1, 2 in der übergebenen Folge
- **`reorder_links` Sicherheitsfall:** Als User A die ID eines Links von User B übergeben → dessen `sort_order` bleibt unverändert. **Dieser Test ist Pflicht, nicht optional.**
- `mcp__supabase__get_advisors` grün bis auf die dokumentierte Free-Tier-Warnung

## Relevante Rules/Skills
- Skills `supabase` und `supabase-postgres-best-practices` **vor** dem Schreiben der Migrationen laden
- `CLAUDE.md` Kernprinzip 3: RLS auf jeder Tabelle, nach Schema-Änderungen `get_advisors`
- `guidelines.md` 002 (Username nullable, kein Fallback) und 005 (Trigger-Ansatz mit `search_path`-Absicherung)
- `rules/verification.md`, Abschnitt Supabase-Schema

## Status
✅ fertig

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief

- **Was lief gut:** Alle drei Migrationen liefen im ersten Anlauf durch. Der komplette Validierungsblock — inklusive des Pflicht-Sicherheitstests von `reorder_links` — ließ sich rein über SQL fahren, ohne UI und ohne echten Login: `set local role authenticated` plus `set local request.jwt.claims` in einer Transaktion reicht, damit `auth.uid()` den gewünschten User liefert. Security-Advisors sind leer, `typecheck` und `lint` grün.
- **Was war unerwartet:** (1) Zwei Spec-Tasks waren bereits erfüllt — `on delete cascade` lag auf beiden FKs an, der Index `(user_id, sort_order)` existierte ebenfalls. `list_tables` zeigt Foreign Keys, verrät die Delete-Rule aber nicht; dafür braucht es `pg_constraint`. (2) Übergibt man `reorder_links` eine fremde ID, bleibt die fremde Zeile korrekt unberührt, aber die Ordinalität zählt trotzdem über das ganze Array — die eigene Nummerierung bekommt dadurch eine Lücke. Kein Sicherheitsproblem, aber in Spec 06 muss der Client immer die vollständige eigene Liste schicken.
- **Was fließt in `learning.md`:** Ist-Zustand vor jeder Migration live abfragen statt der Spec zu glauben; das `set local`-Muster als Standardweg für RLS-Tests in den Specs 05–08; das Ordinalitäts-Verhalten von `reorder_links` als Vorgabe für den Client in Spec 06.
