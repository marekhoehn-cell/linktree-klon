# 05 — Link-CRUD

## Ziel
Der Nutzer kann Links anlegen, bearbeiten und löschen, ohne dass die Seite dabei neu lädt. Änderungen sind sofort sichtbar und werden dauerhaft gespeichert.

## Abhängigkeiten
- `04-dashboard-shell.md` ✅

## Out of Scope
- Sortieren der Links → `06-link-reordering.md`. Neue Links werden hier schlicht ans Ende gehängt
- Andere Link-Typen als URLs (`guidelines.md` 007)
- Vorschaubilder, Symbole je Link, Gruppierung mit Überschriften — alles Backlog
- **Ein Schalter zum Ausblenden einzelner Links** (`guidelines.md` 008). Die Spalte `is_active` bleibt im Schema und auf `true`, bekommt aber kein Bedienelement

## Datenlage
Tabelle `public.links`, bereits vorhanden: `title` (1–80 Zeichen), `url` (nur `http(s)://`), `sort_order` (integer), `is_active` (boolean, default true — wird hier nicht angefasst). RLS-Policies für Select/Insert/Update/Delete auf eigene Zeilen existieren.

## Akzeptanzkriterien
- [x] Über „Link hinzufügen" öffnet sich ein Formular mit den Feldern Titel und URL
- [x] Ein neu angelegter Link erscheint **am Ende** der Liste und erhält den nächsthöheren `sort_order`
- [x] Ein Titel mit 0 oder über 80 Zeichen wird abgelehnt, mit Meldung am Feld
- [x] Eine URL ohne `http://` oder `https://` wird abgelehnt, mit Meldung am Feld
- [x] Eine URL wird beim Speichern automatisch um `https://` ergänzt, wenn der Nutzer das Schema weggelassen hat
- [x] Bearbeiten öffnet dasselbe Formular mit vorbelegten Werten; Speichern aktualisiert die Karte sofort
- [x] Löschen fragt vorher nach und entfernt den Link danach aus Liste und Vorschau
- [x] Neu angelegte Links haben `is_active = true` (Standardwert der Datenbank, wird nicht explizit gesetzt)
- [x] Alle Änderungen sind ohne vollständigen Seiten-Neuaufbau sichtbar
- [x] Schlägt eine Aktion fehl, springt die Liste in den vorherigen Zustand zurück und es erscheint eine Fehlermeldung
- [x] Die Vorschau im Telefon-Rahmen zeigt jede Änderung unmittelbar
- [x] Ein zweiter Testnutzer sieht die Links des ersten **nicht** — im Dashboard durch den Filter
      `eq("user_id", …)` in `getLinks()`. **Nicht** durch RLS: `links_select_public_active` erlaubt
      jedem das Lesen aktiver Links, weil die öffentliche Seite (AP 08) das braucht. Schreibzugriffe
      auf fremde Zeilen sind durch RLS abgesichert (0 Zeilen bzw. Fehler 42501).

## Tasks
- [x] `src/lib/validation/link.ts` — Zod-Schema für Titel und URL, inkl. Ergänzung des Schemas
- [x] `src/app/dashboard/links/actions.ts` — Server Actions `createLink`, `updateLink`, `deleteLink`; jede prüft die Anmeldung über `requireUserId()` und validiert erneut serverseitig
- [x] `sort_order` beim Anlegen aus `max(sort_order) + 1` des Nutzers ermitteln
- [x] `src/components/dashboard/link-list.tsx` — Client-Komponente, erhält die Links als Prop aus der Server Component
- [x] `src/components/dashboard/link-card.tsx` — Titel, gekürzte URL, Bearbeiten, Löschen; alle Bedienelemente ≥ 44 px
- [x] `src/components/dashboard/link-form-dialog.tsx` — Dialog für Anlegen und Bearbeiten
- [x] Löschbestätigung über einen Bestätigungsdialog
- [x] `useOptimistic` für sofortige Rückmeldung; Fehlerfall zeigt einen Toast
- [x] `revalidatePath('/dashboard')` und `revalidatePath('/u/' + username)` nach jeder Mutation

Zusätzlich entstanden: `src/lib/link-form-state.ts` (Typen außerhalb der `"use server"`-Datei),
`src/lib/supabase/links.ts` (`getLinks`), `src/components/dashboard/links-workspace.tsx`
(`useOptimistic`-Klammer über Liste **und** Vorschau) und `delete-link-dialog.tsx`.

## Validation
- `npx tsc --noEmit` grün, `npm run build` ohne Fehler
- Klickpfad: Link anlegen → erscheint am Ende → bearbeiten → Titel ändert sich in Liste und Vorschau → löschen → Bestätigung → verschwindet aus beiden
- Eingabeprüfung: Titel leer → Meldung; URL `abc` → Meldung; URL `beispiel.de` → wird als `https://beispiel.de` gespeichert
- **RLS-Test (Pflicht):** Mit einem zweiten Testnutzer anmelden → dessen Dashboard ist leer. Zusätzlich per SQL versuchen, einen fremden Link zu ändern → keine Zeile betroffen
- Fehlerfall: Netzwerk in den Entwicklerwerkzeugen auf offline stellen, Link anlegen → Liste springt zurück, Fehlermeldung erscheint
- Sichtprüfung im Browser bei 1440 px und 390 px

## Relevante Rules/Skills
- `CLAUDE.md` Kernprinzip 2 (Validierung client und server) und 3 (RLS)
- Skill `supabase` für die Server Actions
- `rules/design-system.md` (Kartenhöhe ~60 px, `rounded-2xl`, Übergänge 180 ms)
- `references/design-analysis.md` Abschnitt 6

## Status
✅ fertig

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief

- **Was lief gut:** Ein Dialog für beide Fälle hat sich gelohnt — Radix hängt den Inhalt beim
  Schließen aus dem Baum, deshalb setzt sich der Formular-State beim Öffnen von selbst zurück, ohne
  `useEffect`. Der optimistische State über Liste **und** Vorschau zu legen war die richtige
  Entscheidung: beide Ansichten sind dadurch immer synchron, ohne zweiten Datenpfad.
- **Was war unerwartet:** Der Offline-Test wäre beinahe als bestanden durchgegangen. Die Liste sprang
  korrekt zurück, aber die Fehlermeldung fehlte — ein nicht erreichbarer Server lässt den Aufruf
  einer Server Action **werfen**, statt `{ ok: false }` zu liefern. Zweitens trägt RLS das
  Akzeptanzkriterium zum zweiten Testnutzer gar nicht; der Leseschutz kommt aus dem `eq`-Filter.
- **Was fließt in `learning.md`:** Server Actions im Client immer mit `try/catch` **und**
  Rückgabewert-Prüfung. Bei RLS-Tests Lese- und Schreibschutz getrennt nachweisen. Klickpfade über
  den schlanken CDP-Treiber statt `browser-use`. Nach `shadcn add` die neuen Dateien auf fremde
  Dependencies durchsehen.
