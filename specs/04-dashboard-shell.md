# 04 — Dashboard-Shell

## Ziel
Der angemeldete Nutzer hat einen festen Arbeitsbereich: links seine Links, rechts eine Vorschau seiner öffentlichen Seite im Telefon-Rahmen. Er sieht seine eigene Adresse, kann sie kopieren und sich abmelden. Auf dem Telefon gibt es statt der geteilten Ansicht einen Umschalter.

## Abhängigkeiten
- `02-auth-email-passwort.md` ✅
- `03-onboarding-username.md` ✅ (`requireProfile()` wird hier eingesetzt)

## Out of Scope
- Die Link-Liste mit echten Daten → `05-link-crud.md`. Hier entsteht nur das Gerüst mit Empty-State
- Der Inhalt der Vorschau → `08-public-profile-page.md`. Hier wird nur der Rahmen gebaut und ein Platzhalter eingehängt
- Profil-Felder → `07-profil-section.md`
- Farbauswahl → `09-theming-accent-color.md`

## Layout-Vorgaben
Aus `references/design-analysis.md` und `guidelines.md` 002:

- **Desktop (ab `lg`):** zweispaltig. Links der Arbeitsbereich, rechts die Vorschau mit `position: sticky`, damit sie beim Scrollen stehen bleibt.
- **Mobil:** **kein** geteiltes Layout. Die Vorschau öffnet über einen Umschalter bzw. ein Sheet.
- Die Vorschau ist ein Telefon-Rahmen mit einer Innenbreite um **390 px**; der Inhalt darin ist derselbe Container wie die echte öffentliche Seite (`max-width: 480px`).
- `rounded-2xl` als Standard, weiche mehrschichtige Schatten, Übergänge **180 ms `ease-out`**.

## Akzeptanzkriterien
- [x] `/dashboard` ist nur angemeldet erreichbar; ohne Anmeldung landet man auf `/login`
- [x] Ein angemeldeter Nutzer **ohne** Username landet auf `/onboarding`
- [x] Die Kopfzeile zeigt die eigene öffentliche Adresse `/u/<username>` als klickbaren Link, der in einem neuen Tab öffnet
- [x] Neben der Adresse gibt es eine Schaltfläche „Link kopieren", die die vollständige URL in die Zwischenablage legt und eine kurze Rückmeldung zeigt
- [x] Es gibt eine sichtbare Abmelden-Schaltfläche, die zu `/login` führt
- [x] Ab Bildschirmbreite `lg` stehen Arbeitsbereich und Vorschau nebeneinander, die Vorschau bleibt beim Scrollen sichtbar
- [x] Unter `lg` ist die Vorschau ausgeblendet und über einen Umschalter erreichbar
- [x] Ohne Links zeigt der Arbeitsbereich einen gestalteten Empty-State: Symbol, ein erklärender Satz, eine deutliche Schaltfläche „Ersten Link hinzufügen"
- [x] Es werden **keine** Beispiel-Links automatisch angelegt (`guidelines.md` 006)
- [x] Jedes interaktive Element hat sichtbare Hover- **und** Focus-Zustände; die Seite ist per Tabulator vollständig bedienbar
- [x] Alle Bedienelemente sind mindestens 44 × 44 px groß

## Tasks
- [x] `src/app/dashboard/layout.tsx` — Server Component mit `requireProfile()`-Guard (zusätzlich Seitengerüst + Kopfzeile, damit 05/07 sie erben)
- [x] `src/components/dashboard/dashboard-header.tsx` — Adresse, Kopier-Schaltfläche, Abmelden
- [x] `src/components/dashboard/copy-link-button.tsx` — Client-Komponente mit Zwischenablage und Rückmeldung
- [x] `src/components/dashboard/phone-frame.tsx` — Telefon-Rahmen, Innenbreite 386 px, mehrschichtiger Schatten
- [x] `src/components/dashboard/preview-panel.tsx` — sticky auf Desktop, Sheet auf Mobil
  - [x] zusätzlich `mobile-preview-sheet.tsx` (Client) herausgelöst, damit das Panel Server-Komponente bleibt
  - [x] zusätzlich `preview-placeholder.tsx` — Platzhalter bis Paket 08
- [x] `src/app/dashboard/page.tsx` — zweispaltiges Raster, Empty-State
- [x] `src/components/dashboard/empty-state.tsx`
- [x] Benötigte shadcn-Komponenten ergänzen — `sheet` ergänzt (`button` lag vor). Kein `sonner`: Rückmeldung läuft inline im Kopier-Button
- [x] Sichtprüfung im Browser bei 1440 px, 1024 px und 390 px Breite

## Validation
- `npx tsc --noEmit` grün, `npm run build` ohne Fehler
- Klickpfad: anmelden → `/dashboard` → Empty-State sichtbar → „Link kopieren" → Adresse liegt in der Zwischenablage → eigene Adresse im neuen Tab öffnen → öffentliche Seite lädt
- Guard: abmelden → `/dashboard` → landet auf `/login`
- Responsive: Fenster von 1440 px auf 390 px verkleinern → Vorschau verschwindet aus dem Fluss und ist über den Umschalter erreichbar; **kein** horizontaler Scrollbalken
- Tastatur: mit Tabulator durch die Seite — jedes erreichbare Element hat einen sichtbaren Fokusrahmen
- Sichtprüfung im echten Browser, mindestens 3 Durchgänge pro Komponente (`CLAUDE.md`, Tools)

## Relevante Rules/Skills
- `rules/design-system.md` (Dark Mode, keine flachen Farben, `rounded-2xl`, weiche Schatten, Übergänge)
- `references/design-analysis.md` Abschnitt 1 und 6 (zentrierter Container, gemessene Werte)
- `rules/code-conventions.md` (Server Components als Standard)

## Status
✅ fertig

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief

- **Was lief gut:** Das CDP-Testmuster aus AP 02 ließ sich direkt übernehmen — Login, Layout-Messungen bei drei Breiten, Sheet-Bedienung und der Guard-Test liefen ohne LLM-Agenten durch. Die Entscheidung, `"use client"` konsequent nach unten zu drücken, hat sich beim Sheet ausgezahlt: der Vorschau-Inhalt bleibt serverseitig gerendert und wird nur als `children` durchgereicht, was in Paket 08 das Einhängen der echten Seiten-Komponente trivial macht. Auf `sonner` zu verzichten hat eine Dependency und die Provider-Verkabelung im Root-Layout gespart, ohne dass die Rückmeldung schlechter wäre.
- **Was war unerwartet:** Zwei von drei automatisierten Prüfungen der Barrierefreiheit lagen falsch — `offsetParent` meldet `position: fixed`-Elemente als unsichtbar, und Tailwinds `ring-*` erzeugt eine `box-shadow` statt eines `outline`. Beide Male stand der Messwert gegen den Screenshot, und beide Male hatte der Screenshot recht. Der Fokusring musste am Ende von Marek im echten Browser bestätigt werden. Zweite Überraschung: Der Entwurf sah im Light Mode deutlich schwächer aus als im Dark Mode, obwohl beide dieselben Tokens nutzen — auslaufende Transparenz-Gradients lösen Flächen im helleren Theme auf.
- **Was fließt in `learning.md`:** Vier Einträge — Sichtbarkeit nie über `offsetParent` prüfen; Fokus-Zustände nicht an einer einzelnen CSS-Eigenschaft messen, sondern per Screenshot belegen; nach jeder Code-Änderung erst `npm run typecheck`, dann der Browser-Lauf (ein JSX-Kommentar nach `return (` hat einen kompletten Durchgang gekostet); Trägerflächen bekommen volle Token-Farbe statt auslaufender Gradients.
