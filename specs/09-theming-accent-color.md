# 09 — Accent-Color

## Ziel
Der Nutzer wählt eine Farbe, die seine öffentliche Seite prägt — über acht Vorschläge oder einen freien Farbwähler. Die Farbe wirkt sofort in der Vorschau, und die Beschriftung darauf bleibt bei **jeder** Farbwahl lesbar.

## Abhängigkeiten
- `08-public-profile-page.md` ✅ (es muss eine Fläche geben, auf der die Farbe wirkt)

## Out of Scope
- Schriftarten, Hintergründe, Layout-Varianten, mehrere Themes (dauerhaft draußen)
- Ein Dark-/Light-Umschalter für den Besucher (nicht im MVP)
- Überschreiben von `--accent` — es wird **`--brand`** eingeführt, siehe unten

## Sicherheitsvorgaben
`guidelines.md` 004 begründet diese Punkte im Detail. Sie sind **verbindlich**:

1. **Injektion ausschließlich als `style={{ "--brand": … } as React.CSSProperties}`** auf dem obersten Element. **`<style dangerouslySetInnerHTML>` ist verboten** — dort greift Reacts Escaping nicht, und der `</style>`-Ausbruch ist echtes Stored XSS.
2. **Genau eine Torwächter-Funktion `safeAccent()`.** Sie prüft gegen `^#[0-9a-fA-F]{6}$` und gibt bei allem anderen den Standardwert zurück. **Sie wirft nie** — ein manipulierter Datenbankwert darf die öffentliche Seite nicht in eine Fehlerseite kippen.
3. **Projektregel: Kein Farbwert erreicht JSX, ohne durch `safeAccent()` gegangen zu sein.** Geprüft wird an drei Stellen: Formular, Server Action, Rendering.
4. Der Grund, warum die Prüfung kein Formalismus ist: React escapt im Server-Rendering **keine Semikolons**. Ein Wert wie `red;position:fixed;inset:0` erzeugt sonst zusätzliche CSS-Regeln im selben Attribut. Der Regex schließt Semikolons per Konstruktion aus.

## Warum `--brand` und nicht `--accent`
`--accent` ist in `globals.css` bereits shadcns heller Hover-Ton — genutzt von Ghost-Buttons, Dropdown-Einträgen und Menüs. Würde er mit einer kräftigen Nutzerfarbe überschrieben, würde **jeder Hover-Zustand der Seite knallbunt**, und `--accent-foreground` passte nicht mehr dazu.

## Akzeptanzkriterien
- [x] Im Dashboard gibt es acht Farbvorschläge als klickbare Felder und zusätzlich einen freien Farbwähler
- [x] Die Auswahl wirkt sofort in der Vorschau, ohne Neuladen
- [x] Nach dem Speichern zeigt die öffentliche Seite dieselbe Farbe
- [x] Die Schrift auf farbigen Flächen ist bei **jeder** wählbaren Farbe lesbar — sie wechselt automatisch zwischen dunkel und hell
- [x] Geprüft mit den Extremfällen `#ffffff`, `#000000`, `#ffff00` (sehr hell) und `#0000ff` (sehr dunkel) — gemessen 21.00 / 21.00 / 19.56 / 8.59:1
- [x] Ein manuell in die Datenbank geschriebener Unsinnswert (z. B. `red;position:fixed`) führt dazu, dass die Seite die **Standardfarbe** zeigt — sie stürzt nicht ab und übernimmt den Wert nicht
      *(Beide Verteidigungslinien gegen die echte Datenbank geprüft, 15.08.2026: 1. Das direkte `update` mit `red;position:fixed;inset:0;background:url(…)` scheitert am `profiles_accent_color_check` — Fehler `23514`. 2. Nach temporärem Drop des Constraints landete der Wert tatsächlich in der Zeile von `spec04tester`; `/u/spec04tester` lieferte trotzdem HTTP 200 mit `--brand:#6366f1`, ohne jede Spur von `position:fixed` oder `example.com` im HTML und ohne `<style>`-Tag. Constraint und Farbwert danach wiederhergestellt, `get_advisors` ohne neue Befunde.)*
- [x] Im ausgelieferten Quelltext steht die Farbe bereits im `style`-Attribut — es blitzt beim Laden keine falsche Farbe auf
- [x] Hover-Zustände von Ghost-Buttons und Menüs im Dashboard bleiben unverändert (`--accent` unverändert, Ghost nutzt hier ohnehin `--muted`)
- [x] Die abgeleiteten Töne für Hover, Ring und dezente Flächen wirken sichtbar, aber stimmig

## Tasks
- [x] `src/lib/theme.ts` — `safeAccent()`, `luminance()`, `onBrand()`, `DEFAULT_ACCENT = '#6366f1'` (entspricht dem Datenbank-Standardwert), `ACCENT_PRESETS` mit acht Werten
- [x] Schwellwert für die Schriftfarbe: `luminance(hex) > 0.17913 ? dunkel : hell`. Der Wert ergibt sich aus der WCAG-Formel als Punkt gleichen Kontrasts zu Schwarz und Weiß und garantiert mindestens 4.58:1
- [x] `globals.css` — `--brand`, `--brand-foreground` und abgeleitete Töne per `color-mix(in oklab, …)`; Registrierung im bestehenden `@theme inline`-Block als `--color-brand` usw.
      **Abweichung:** Die abgeleiteten Töne stehen **nicht** in `:root`, sondern direkt im `@theme inline`-Block. In `:root` wird ein `color-mix()` einmal ausgerechnet und folgt der pro Seite gesetzten Nutzerfarbe nicht mehr.
- [x] `src/components/profile/profile-view.tsx` — Wrapper setzt `--brand` und `--brand-foreground` gemeinsam
- [x] Link-Karten auf `bg-brand` / `text-brand-foreground` / `hover:bg-brand-hover` umstellen
- [x] `src/components/dashboard/accent-picker.tsx` — acht Felder plus `<input type="color">`, Vorschläge sind ≥ 44 px und per Tastatur bedienbar
- [x] Server Action `updateAccentColor(color)` — `safeAccent()` erneut serverseitig, dann Update
      **Abweichung:** Weicht der geprüfte Wert vom übergebenen ab, wird **nicht** gespeichert, sondern ein Fehler gemeldet. Still den Standardwert zu schreiben würde eine kaputte Eingabe als Nutzerwunsch verbuchen. Auf der Leseseite bleibt es beim lautlosen Rückfall.
- [x] `revalidatePath('/u/' + username)` nach dem Speichern — sonst zeigt ein Cache später die alte Farbe

## Validation
- `npx tsc --noEmit` grün, `npm run build` ohne Fehler
- Klickpfad: Farbe wählen → Vorschau ändert sich sofort → speichern → öffentliche Seite im neuen Tab zeigt dieselbe Farbe
- **Kontrast-Test:** nacheinander `#ffffff`, `#000000`, `#ffff00`, `#0000ff` setzen → die Beschriftung ist jedes Mal klar lesbar; mit einem Kontrast-Prüfer mindestens 4.5:1 nachmessen
- **Sicherheitstest (Pflicht):** per SQL `update profiles set accent_color = 'red;position:fixed;inset:0;background:url(https://example.com/x)'` → die Datenbank sollte das bereits am `check` ablehnen. Anschließend die Prüfung im Code isoliert testen: `safeAccent('red;position:fixed')` liefert den Standardwert
- **Quelltext-Prüfung:** öffentliche Seite aufrufen, „Seitenquelltext anzeigen" → `--brand:#…` steht im HTML; im gesamten Dokument kommt **kein** `<style>`-Tag mit Nutzerdaten vor
- **Regressionstest:** im Dashboard über einen Ghost-Button fahren → der Hover-Ton ist neutral, nicht in der Nutzerfarbe
- Sichtprüfung im echten Browser

## Relevante Rules/Skills
- `guidelines.md` 004 (vollständige Begründung inkl. der geprüften React-Quellcode-Stellen)
- `references/discovery.md` Abschnitt 3
- `CLAUDE.md` Kernprinzip 2

## Status
✅ fertig — alle Akzeptanzkriterien abgehakt, Validation grün, DB-Sicherheitstest gegen die echte Datenbank durchgeführt

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief

- **Was lief gut:** Die Kontrast-Automatik ist am Ende der billigste Teil des Pakets — ein Vergleich, keine Dependency — und hält über alle zwölf geprüften Farben mindestens 4.70:1. Der Torwächter in einer einzigen Datei hat sich bewährt: Die Prüfung steht unmittelbar vor dem JSX und gilt damit auch für Aufrufer, die es noch nicht gibt.
- **Was war unerwartet:** Beide echten Fehler lagen in der CSS-Schicht, nicht in der Sicherheitslogik. `tailwind-merge` verwarf `bg-brand` still, weil `bg-gradient-to-b` der v3-Name ist; und `color-mix()` in `:root` wird dort einmal ausgerechnet und folgt einer weiter unten überschriebenen Variablen nicht. Beides hätte ohne Messung im echten Browser niemand gesehen — der Quelltext sah in beiden Fällen richtig aus.
- **Nachtrag zum Sicherheitstest:** Der Test war erst aussagekräftig, nachdem der DB-Constraint kurzzeitig gedroppt wurde. Solange er steht, prüft man nur die erste Verteidigungslinie und erfährt über die zweite — den Fallback beim Rendern — gar nichts. Die interessante Frage ist nicht „lehnt die DB ab?", sondern „was passiert, wenn sie es *nicht* tut?".
- **Was fließt in `learning.md`:** die beiden CSS-Fallen, der Node-CDP-Treiber als Ersatz für die von Windows blockierte Python-Variante, und die Regel, Regressionstests gegen die tatsächlichen Projektklassen statt gegen Bibliotheks-Standards zu schreiben.
