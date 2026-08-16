# 06 — Sortierung per Drag-and-Drop und Tastatur

## Ziel
Der Nutzer bringt seine Links in die gewünschte Reihenfolge — durch Ziehen an einem Griff oder über Pfeil-Schaltflächen an jeder Karte. Die neue Reihenfolge ist sofort sichtbar, wird dauerhaft gespeichert und erscheint genauso auf der öffentlichen Seite.

## Abhängigkeiten
- `05-link-crud.md` ✅
- `01-datenmodell-ergaenzungen.md` ✅ (Funktion `reorder_links`)
- **Paket `motion` muss installiert werden** — es ist derzeit *nicht* im Projekt (`npm i motion`)

## Out of Scope
- Sortieren per Ziehen über Gruppen hinweg (es gibt keine Gruppen)
- Sortierung auf der öffentlichen Seite ändern — dort wird nur gelesen

## Pflicht-Maßnahmen
`guidelines.md` 003 hat sich bewusst für Framer Motion `Reorder` entschieden, obwohl die Recherche dnd-kit empfahl. Die folgenden vier Punkte fangen die bekannten Schwächen ab und sind **verbindlich**:

1. **Nur ein Griff ist ziehbar, nicht die ganze Karte.** `Reorder.Item` bekommt `dragListener={false}` plus `useDragControls`; der Griff startet das Ziehen über `onPointerDown`.
2. **`touch-action: none` ausschließlich auf dem Griff.** Läge es auf der Karte, könnte man die Seite auf dem Telefon nicht mehr durch Wischen über die Liste scrollen.
3. **Gespeichert wird beim Loslassen, nicht während des Ziehens.** `onReorder` aktualisiert ausschließlich den lokalen Zustand; der Server wird erst in `onDragEnd` gerufen. Andernfalls entstehen pro Ziehvorgang dutzende Aufrufe.
4. **`position: relative` auf jedem Item**, sonst greift Motions Ebenen-Verwaltung nicht und die gezogene Karte verschwindet unter ihren Nachbarn.

Zusätzlich: Motion bietet **keine** Tastatur-Bedienung. Die Pfeil-Schaltflächen sind deshalb kein Zusatz, sondern der einzige Weg für Tastaturnutzer.

## Akzeptanzkriterien
- [x] Jede Karte hat links einen sichtbaren Griff; der Mauszeiger wird dort zu `grab` bzw. `grabbing` — gemessen: `cursor: grab`, `active:cursor-grabbing`
- [x] Ziehen am Griff ordnet die Liste um, die übrigen Karten weichen animiert aus
- [x] Beim Ziehen an der Karte **außerhalb** des Griffs passiert nichts — Zug über 360 px an der Kartenmitte: Reihenfolge unverändert, 0 Server-Aufrufe
- [x] Die neue Reihenfolge ist nach einem Neuladen der Seite unverändert
- [ ] Die öffentliche Seite zeigt dieselbe Reihenfolge — **nicht prüfbar, `/u/<username>` entsteht erst in Paket 08.** Ersatzweise geprüft: die Live-Vorschau im Dashboard zeigt dieselbe Reihenfolge. In 08 nachzuholen
- [x] Während eines Ziehvorgangs erfolgt **genau ein** Speicheraufruf — Zug über vier Positionen: exakt 1 `POST /dashboard` mit `Next-Action`-Header
- [x] Jede Karte hat eine Hoch- und eine Runter-Schaltfläche; bei der obersten ist „hoch" deaktiviert, bei der untersten „runter" — 13/13 Karten, Randbuttons `disabled` und nicht fokussierbar
- [x] Die Reihenfolge lässt sich vollständig per Tastatur ändern, ohne Maus — per Tab erreicht, Enter verschiebt, Fokus wandert mit der Karte
- [x] Auf dem Telefon lässt sich die Seite weiterhin durch Wischen **über den Karten** scrollen — bei 390 px mit 13 Karten: `scrollY 0 → 389`, Reihenfolge unverändert
- [x] Auf dem Telefon funktioniert das Ziehen am Griff — Touch-Zug sortierte um, 1 Server-Aufruf, Seite scrollte dabei nicht
- [x] Die gezogene Karte liegt sichtbar über den anderen (Schatten, Hervorhebung) — im gehaltenen Zug gemessen: `z-index 1` statt `auto`, xl-Schatten statt sm, `scale(1.02)`, Akzent-Rahmen
- [x] Schlägt das Speichern fehl, springt die Liste in die alte Reihenfolge zurück und ein Fehler-Toast erscheint — offline: optimistischer Tausch, dann Rücksprung, Toast „Das hat gerade nicht geklappt."

## Tasks
- [x] `npm i motion` und in `guidelines.md`/`rules/tech-stack.md` vermerken — `motion@13.1.0`
- [x] `src/components/dashboard/link-list.tsx` auf `Reorder.Group` umstellen (`axis="y"`, `values`, `onReorder`)
- [x] `src/components/dashboard/link-card.tsx` zu `Reorder.Item` mit `dragListener={false}`, `dragControls`, `style={{ position: 'relative' }}`
- [x] Griff-Komponente mit `GripVertical`-Symbol, `touch-none`, `aria-label="Reihenfolge ändern"`, Mindestgröße 44 px — gemessen 44 × 44 px
- [x] Server Action `reorderLinks(linkIds: string[])` — Zod-Prüfung auf UUID-Array, dann Aufruf der Datenbankfunktion `reorder_links`; **es werden nur IDs übertragen, keine Positionen**
- [x] `onDragEnd` am Item ruft die Server Action mit der aktuellen Reihenfolge
- [x] Hoch/Runter-Schaltflächen, die dieselbe Server Action mit vertauschten Nachbarn aufrufen
- [x] `useOptimistic` für die Reihenfolge — genau **eine** Quelle der Wahrheit, kein zusätzliches `useState` daneben
- [x] `revalidatePath('/dashboard')` und `revalidatePath('/u/' + username)` — über `revalidateLinkViews()` aus Paket 05

## Validation
- `npx tsc --noEmit` grün, `npm run build` ohne Fehler
- Klickpfad Maus: fünf Links anlegen, den untersten nach oben ziehen → Reihenfolge stimmt → Seite neu laden → Reihenfolge unverändert → öffentliche Seite prüfen → identisch
- **Netzwerk-Prüfung:** Entwicklerwerkzeuge öffnen, einen Link über mehrere Positionen ziehen → **genau ein** Aufruf der Server Action. Mehrere Aufrufe bedeuten, dass Pflicht-Maßnahme 3 verletzt ist
- Tastatur: Maus beiseite, per Tabulator zur Hoch-Schaltfläche, mit Enter mehrfach auslösen → Karte wandert nach oben, Reihenfolge bleibt nach Neuladen
- **Mobil-Prüfung (Pflicht, nicht optional):** In der Geräte-Emulation bei 390 px Breite (a) durch Wischen über den Karten scrollen — muss funktionieren; (b) am Griff ziehen — muss funktionieren. Beides muss gleichzeitig gehen. `guidelines.md` 003 erklärt diese Auflage
- Fehlerfall: Netzwerk auf offline, umsortieren → Liste springt zurück, Toast erscheint
- **Sicherheitstest:** Server Action mit der Link-ID eines fremden Nutzers aufrufen → dessen Reihenfolge bleibt unverändert

## Rückfallweg
Scheitert die Mobil-Prüfung an einem Motion-Fehler, der sich nicht in vertretbarer Zeit beheben lässt: Umstieg auf **dnd-kit v1** (`@dnd-kit/core` + `@dnd-kit/sortable`). Der vollständige Vergleich samt Beispielcode liegt in `references/discovery.md` Abschnitt 4. Diesen Fall im Debrief und in `learning.md` festhalten.

## Relevante Rules/Skills
- `guidelines.md` 003 (die vier Pflicht-Maßnahmen und ihre Begründung)
- `references/discovery.md` Abschnitt 4 (Fallstricke bei Touch, `useOptimistic`-Fehler)
- `rules/verification.md` (UI-Komponente)

## Status
✅ fertig — ein Kriterium bleibt bis Paket 08 offen (öffentliche Seite existiert noch nicht)

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief

- **Was lief gut:** Die vier Pflicht-Maßnahmen haben genau das verhindert, wofür sie gedacht waren — der Zug über vier Positionen erzeugte exakt **einen** Server-Aufruf, und `touch-action: none` sitzt messbar nur am Griff (Karte und Liste bleiben `auto`), weshalb Wischen und Ziehen bei 390 px gleichzeitig funktionieren. Der Rückfallweg auf dnd-kit war nicht nötig. Die Verifikation lief deterministisch über das DevTools-Protokoll statt über einen LLM-gesteuerten Browser, wodurch das Zählen von Aufrufen und das Offline-Schalten exakt reproduzierbar waren.

- **Was war unerwartet:**
  1. **`useOptimistic` und Ziehen passen nicht von sich aus zusammen.** React verwirft den optimistischen Stand am Ende der auslösenden Transition — während eines Zuges läuft aber noch keine Server-Anfrage. Die Lösung ohne zweiten State: Jede Zwischenreihenfolge läuft in einer eigenen Transition, die über ein offenes Versprechen bis zum Loslassen gehalten wird; `handleDragEnd` legt die Endreihenfolge auf den Stapel und gibt erst danach alle Haltungen frei, damit kein Zwischenstand aufblitzt.
  2. **Motion überschreibt CSS-Klassen am gezogenen Item.** `data-[dragging=true]:shadow-xl` und `:z-20` blieben wirkungslos, `border-ring` griff. Ursache: Motion setzt Ebene und Transform des Items per Inline-Style — selbst ein von Hand gesetztes `element.style.boxShadow` wurde nicht wirksam. Hervorhebungen gehören deshalb in `whileDrag`, nicht in Utility-Klassen.
  3. **Zwei Messfehler hätten fast zu falschen Befunden geführt:** CDP-synthetische Maus-Events lösen Motions Drag nicht aus (es hängt an `setPointerCapture`) — der Eindruck „der Griff funktioniert nicht" war ein Werkzeugartefakt. Und `Input.synthesizeScrollGesture` scrollt in dieser Emulation gar nicht, auch weit außerhalb der Liste; erst `Input.dispatchTouchEvent`-Sequenzen lieferten den echten Nachweis. Beide Male war die Gegenprobe an einer unbeteiligten Stelle entscheidend.
  4. **Ein per SQL angelegter Auth-User kann sich nicht anmelden**, solange die Token-Spalten `NULL` sind — GoTrue liest sie als nicht-nullable Strings. Der Passwort-Hash war korrekt (`crypt(...) = encrypted_password`), die Anmeldung scheiterte trotzdem mit „E-Mail oder Passwort ist falsch".

- **Was fließt in `learning.md`:** das Transitions-Halte-Muster für Drag mit `useOptimistic`; Motions Vorrang bei Inline-Styles; die Grenzen von CDP bei Drag und Scroll samt der Pflicht zur Gegenprobe; das `NULL`-Token-Problem bei per SQL erzeugten Auth-Usern.
