# Backlog — Ideen-Parkplatz

Hier landet alles, was während der Arbeit auftaucht, aber **nicht** zum MVP gehört. Zweck: Ideen festhalten, ohne den Scope aufzuweichen. Eine Zeile im Backlog kostet nichts — ein ungeplantes Feature im Code kostet den Zeitplan.

## Format

```
- [ ] Idee — Kontext/Warum — Bezug zu Spec
```

- **Idee:** in wenigen Worten, was gebaut würde
- **Kontext/Warum:** wobei das aufgefallen ist und welches Problem es löst
- **Bezug zu Spec:** auf welche Spec bzw. welches Arbeitspaket es sich bezieht, oder „neu", wenn es nichts Bestehendes berührt

Beispielzeile (nur zur Illustration, kein echter Eintrag):

```
- [ ] Link-Icons automatisch aus Domain ableiten — beim Testen wirkten die Links ohne Icon flach — Bezug: Spec Link-CRUD
```

Abgehakte Einträge (`- [x]`) bleiben stehen, ergänzt um das Datum der Umsetzung.

## Natürliche erste Kandidaten

Die bewusst aus dem MVP ausgeschlossenen Punkte sind bereits durchdachte Backlog-Kandidaten — sie werden erst dann als Eintrag hier aufgenommen, wenn sie konkret angegangen werden sollen:

- OAuth-Provider (Google, GitHub, …)
- Mehrere Pages pro User
- Avatar-Upload via Supabase Storage statt URL-Feld
- Click-Analytics pro Link
- Fortgeschrittenes Theming: Fonts, Backgrounds, Layout-Varianten
- Embed-Link-Typen (Spotify, YouTube, …)
- Custom Domains
- Monetarisierung
- Mehrsprachigkeit

## Einträge

- [ ] `mailto:`- und `tel:`-Links als eigene Link-Typen — kam in der Sparringssession (Phase 2) auf; würde ein Typ-Feld in `links` plus typabhängige Validierung, Icons und Rendering nach sich ziehen. Bewusst verworfen, siehe `guidelines.md` 007 — Bezug: Spec Link-CRUD
- [ ] Kontrast-Vorschau in der Accent-Color-Auswahl — die automatische Schwarz/Weiß-Umschaltung (`guidelines.md` 004) garantiert bereits WCAG AA; ein sichtbarer Kontrastwert neben dem Picker wäre didaktisch reizvoll, ist aber kein MVP-Bedarf — Bezug: Spec Theming
- [ ] Schalter „Link vorübergehend ausblenden" — Spalte `is_active` und Policy `links_select_public_active` existieren bereits im Schema, es fehlt nur das Bedienelement plus eine Server Action. Bewusst aus dem MVP genommen, siehe `guidelines.md` 008 — Bezug: Spec 05 Link-CRUD
- [ ] Link-Karte im Dashboard mit „Öffnen"-Knopf (Ziel-Adresse in neuem Tab) — beim Sichttest von Spec 05 fiel auf, dass sich die gespeicherte Adresse nicht ohne Umweg prüfen lässt; erst entscheiden, wenn die öffentliche Seite steht, weil sie die Links ohnehin klickbar zeigt — Bezug: Spec 05 Link-CRUD
- [ ] Rückfallweg dnd-kit dokumentieren, falls Motion Reorder auf Mobile scheitert — Alternative ist in `references/discovery.md` Abschnitt 4 vollständig ausgearbeitet — Bezug: Spec Link-Reordering
- [ ] Font-Mismatch auflösen — `src/app/globals.css` setzt `--font-sans: Plus Jakarta Sans` und `html { @apply font-sans }`, `src/app/layout.tsx` lädt aber Geist unter `--font-geist-sans`/`--font-geist-mono`. Die Geist-Variablen werden nie auf `--font-sans` gemappt, Plus Jakarta Sans wird nie geladen — es läuft projektweit der System-Fallback. Zwei Wege: entweder Plus Jakarta Sans laden und auf `--font-sans` mappen (design-system-treu), oder `--font-sans` auf die bereits geladene Geist-Variable zeigen lassen (kleinerer Eingriff). Beim Aufräumen vor Spec 10 bewusst zurückgestellt, weil der Fix das Schriftbild der **gesamten** App ändert und damit jede bisherige visuelle Verifikation hinfällig macht — Bezug: neu (projektweit)
- [ ] Datenschutzerklärung ergänzen — nach DSGVO Art. 13 bei einer App mit Registrierung eigentlich Pflicht; laut `README.md` bewusst außerhalb des MVP-Scopes, deshalb hier statt im Code. Vor einem echten (nicht Demo-)Live-Gang zwingend, zusammen mit den erfundenen Impressumsangaben in `src/app/impressum/page.tsx` — Bezug: Zusatzpaket Impressum + Fußzeile
