# 08 — Öffentliche Profilseite

## Ziel
Jeder Besucher kann unter `/u/<username>` die Seite eines Nutzers ansehen — ohne Anmeldung, schnell geladen und mit ordentlicher Vorschau beim Teilen in Messengern. Ist der Name noch nicht vergeben, wird daraus eine Einladung, ihn selbst zu nehmen.

## Abhängigkeiten
- `05-link-crud.md` ✅ (es muss Links zum Anzeigen geben)
- `07-profil-section.md` ✅ (Kopfbereich und Avatar-Komponente)

## Out of Scope
- Die Akzentfarbe → `09-theming-accent-color.md`. **Diese Seite wird zunächst mit der Standardfarbe gebaut.** Die Reihenfolge ist Absicht: erst die sichtbare Fläche, dann die Farblogik darauf
- Zählen von Klicks, jegliche Statistik (dauerhaft draußen)
- Gruppen-Überschriften zwischen Links (Backlog)

## Gestaltungsvorgaben
Gemessen an echten Seiten, siehe `references/design-analysis.md`:

| Element | Vorgabe |
|---|---|
| Container | `max-width: 480px`, zentriert — **kein eigenes Desktop-Layout** |
| Reihenfolge | Avatar → Anzeigename → Bio → Link-Karten → dezenter Fuß |
| Avatar | 96 px, vollständig rund |
| Link-Karte | `min-height: 60px`, `rounded-2xl`, Text zentriert, 15–16 px, `font-weight: 500` |
| Abstand zwischen Karten | 12–14 px |
| Übergang | 180 ms `ease-out` |
| Oberfläche | Layering und weiche Schatten — **bewusst anders als die Vorbilder**, die durchgehend flach sind |

## Akzeptanzkriterien
- [x] `/u/<username>` ist **ohne Anmeldung** erreichbar und wird nicht zur Anmeldung umgeleitet
- [x] Die Seite zeigt Avatar, Anzeigename (ersatzweise `@<username>`), Bio und alle aktiven Links
- [x] Die Abfrage filtert auf `is_active = true` — passend zur bestehenden Policy `links_select_public_active` (der Filter bleibt, auch wenn es dafür kein Bedienelement gibt, siehe `guidelines.md` 008)
- [x] Die Links stehen in der im Dashboard festgelegten Reihenfolge
- [x] Ein Klick auf eine Karte öffnet das Ziel in einem neuen Tab, mit `rel="noopener noreferrer"`
- [x] Die gesamte Karte ist klickbar, nicht nur der Text
- [x] `/u/<nicht-vergebener-name>` zeigt eine Claim-Seite: „Dieser Name ist noch frei" mit Schaltfläche zur Registrierung, die den Namen vorbelegt
- [x] Ein ungültiger Name (falsche Zeichen, zu kurz, zu lang) führt zu einer regulären 404-Seite, **nicht** zur Claim-Seite
- [x] Beim Teilen in einem Messenger erscheinen Titel, Beschreibung und Bild (Open Graph)
- [x] Die Seite lädt vollständig auch bei deaktiviertem JavaScript (Server-Rendering)
- [x] Bei 390 px Breite gibt es keinen horizontalen Scrollbalken
- [x] Ein Nutzer ohne Links zeigt eine ruhige, nicht kaputt wirkende Seite (Kopfbereich ohne Kartenliste)

## Tasks
- [x] `src/app/u/[username]/page.tsx` — Server Component, `params` ist in Next 16 ein Promise und muss `await`et werden
- [x] Profil und aktive Links in **einer** Abfrage laden, nach `sort_order` sortiert — dafür war eine Migration nötig (Foreign Key `links.user_id → profiles.id`), siehe Debrief
- [x] Namensprüfung: Formal ungültig → `notFound()`; formal gültig, aber nicht vergeben → Claim-Seite
- [x] `src/app/u/[username]/not-found.tsx` — gestaltete 404-Seite
- [x] `src/components/profile/claim-page.tsx` — Einladung mit vorbelegtem Namen im Link zur Registrierung
- [x] `src/components/profile/profile-view.tsx` — **gemeinsame Komponente**, die sowohl hier als auch in der Dashboard-Vorschau (Paket 04) verwendet wird
- [x] `src/components/profile/link-button.tsx`
- [x] `generateMetadata()` für Titel, Beschreibung und Open-Graph-Bild
- [x] Vorschau-Platzhalter aus Paket 04 durch `profile-view` ersetzen
- [x] Sichtprüfung im Browser bei 1440 px und 390 px

Zusätzlich entstanden, weil die Aufgabe es verlangte:
- [x] `src/app/u/layout.tsx` — gemeinsamer Grund für Profilseite, Claim-Seite und 404
- [x] `src/lib/supabase/public-profile.ts` — die Abfrage samt erneuter Adressprüfung
- [x] `src/lib/site-url.ts` + `metadataBase` im Root-Layout — ohne absolute Basis-Adresse kein gültiges `og:image`
- [x] `src/lib/initials.ts` — `getInitials` aus der Client-Komponente gelöst, damit die Bild-Erzeugung sie aufrufen kann
- [x] Username-Vorbelegung von der Claim-Seite über `/signup?username=…` bis ins Onboarding

## Validation
- `npx tsc --noEmit` grün, `npm run build` ohne Fehler
- Klickpfad: in einem **privaten Fenster** (nicht angemeldet) `/u/<eigener-name>` aufrufen → Seite lädt vollständig
- Filter-Prüfung: per SQL bei einem Link `is_active = false` setzen → er verschwindet von der öffentlichen Seite, bleibt im Dashboard sichtbar
- Reihenfolge: im Dashboard umsortieren → öffentliche Seite zeigt dieselbe Folge
- Claim-Seite: `/u/nochfrei123` aufrufen → Einladung erscheint; Schaltfläche führt zur Registrierung mit vorbelegtem Namen
- 404: `/u/ab` und `/u/Max Mustermann` aufrufen → reguläre 404-Seite, **nicht** die Claim-Seite
- Ohne JavaScript: JS in den Entwicklerwerkzeugen abschalten, Seite neu laden → Inhalt weiterhin vollständig sichtbar
- Open Graph: Seitenquelltext auf `og:title`, `og:description`, `og:image` prüfen
- Sichtprüfung im echten Browser, mehrere Durchgänge

## Relevante Rules/Skills
- Next-16-Besonderheiten (`params` als Promise): `node_modules/next/dist/docs/`
- `references/design-analysis.md` Abschnitte 1, 4 und 6
- `rules/design-system.md`

## Status
✅ fertig

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief

- **Was lief gut:** Die gemeinsame Komponente hat sich sofort ausgezahlt. Weil der Telefon-Rahmen im Dashboard innen ~390 px breit ist, braucht die Vorschau keine eigene Typografie — sie zeigt buchstäblich dieselbe Seite. Unterschiede gibt es nur an zwei bewussten Stellen: Klickbarkeit und Leerzustand. Die deterministische Prüfung per CDP (Muster aus Paket 06) hat alle Messwerte der Gestaltungsvorgaben bestätigt: 60 px Kartenhöhe, 14 px Abstand, 15 px/500, 180 ms `ease-out`, 96 px Avatar, kein horizontaler Scroll bei 390 px.

- **Was war unerwartet:**
  1. **Kein Foreign Key zwischen `links` und `profiles`.** Beide zeigten nur auf `auth.users`. PostgREST bettet aber ausschließlich entlang echter Foreign Keys ein — die in der Spec geforderte *eine* Abfrage war ohne Migration unmöglich.
  2. **Next verwirft mehrzeilige Meta-Beschreibungen.** Die Bio des Testkontos enthält ein `\n`; `og:description`, `twitter:description` und `description` fehlten daraufhin **ersatzlos** im Quelltext — ohne Warnung im Build.
  3. **`rounded-2xl` sind in diesem Theme 36 px**, nicht 16 px. Bei einer 60 px hohen Karte ist das mehr als die halbe Höhe, der Browser skaliert die Radien herunter und die Karte wird zur verzogenen Kapsel. Begründete Ausnahme von Regel 6: `rounded-xl` (24 px).
  4. **Tailwind v4 setzt `-translate-y-0.5` auf die `translate`-Property**, nicht auf `transform`. Die Transition lief deshalb ins Leere und der Hover-Versatz wäre ein harter Sprung gewesen — sichtbar nur, weil der Wert gemessen wurde.
  5. **Satori braucht bei jedem Element mit mehr als einem Kind ein explizites `display`.** `@{username}` im JSX sind zwei Kinder — die Bild-Route antwortete mit 500, bis die Texte fertig zusammengesetzt übergeben wurden.

- **Was fließt in `learning.md`:** Punkte 2, 3, 4 und 5 — alle vier sind stille Fehler, die ohne Messung oder Blick in den Quelltext durchgerutscht wären.
