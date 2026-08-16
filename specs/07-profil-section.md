# 07 — Profil-Section

## Ziel
Der Nutzer hinterlegt einen Anzeigenamen, einen kurzen Text über sich und die Adresse eines Profilbilds. Diese Angaben stehen im Kopfbereich seiner öffentlichen Seite.

## Abhängigkeiten
- `04-dashboard-shell.md` ✅

## Out of Scope
- Hochladen von Bildern (dauerhaft draußen — es gibt nur ein Adressfeld, siehe `README.md`)
- Ändern des Usernamens (nicht im MVP)
- Ändern von E-Mail oder Passwort (nicht im MVP)
- Farbauswahl → `09-theming-accent-color.md`

## Datenlage
In `public.profiles` bereits vorhanden: `display_name` (nullable, ≤ 60 Zeichen), `bio` (nullable, ≤ 300 Zeichen), `avatar_url` (nullable, `check` erzwingt Beginn mit `https://`).

> Achtung: Die Datenbank lässt **ausschließlich `https://`** zu, nicht `http://`. Die Prüfung im Formular muss dieselbe Regel verwenden, sonst bekommt der Nutzer statt einer verständlichen Meldung einen Datenbankfehler.

## Akzeptanzkriterien
- [x] Im Dashboard gibt es einen erreichbaren Bereich „Profil" mit den Feldern Anzeigename, Bio und Bild-Adresse — eigene Route `/dashboard/profil`, Kopfzeile mit Navigation „Links | Profil"
- [x] Alle drei Felder dürfen leer bleiben — leer wird als `NULL` gespeichert, nicht als `""`
- [x] Ein Anzeigename über 60 Zeichen wird abgelehnt, mit Meldung am Feld — 61 Zeichen: Meldung, **0** Server-Aufrufe; 60 Zeichen gehen durch
- [x] Eine Bio über 300 Zeichen wird abgelehnt; darunter steht ein Zeichenzähler — 301: Meldung + Zähler rot; 300 geht durch
- [x] Eine Bild-Adresse, die nicht mit `https://` beginnt, wird abgelehnt, mit verständlicher Meldung — `http://beispiel.de/x.png` nennt ausdrücklich das Protokoll als Grund
- [x] Nach dem Speichern erscheint eine Bestätigung; die Vorschau übernimmt die Änderung sofort — Toast „Profil gespeichert."; die Vorschau folgt bereits beim Tippen
- [x] Ist kein Anzeigename gesetzt, zeigt die öffentliche Seite `@<username>` — **in der Vorschau geprüft**, die öffentliche Seite entsteht erst in 08
- [x] Ist keine Bild-Adresse gesetzt, erscheint ein gestalteter Platzhalter mit den Initialen — **kein** kaputtes Bildsymbol
- [x] Lädt das angegebene Bild nicht, wird ebenfalls der Platzhalter gezeigt — `https://beispiel.de/gibtsnicht.png` → Initialen
- [x] Ein zweiter Testnutzer kann diese Werte nicht verändern — 0 betroffene Zeilen, Gegenprobe auf die eigene Zeile: 1

## Tasks
- [x] `src/lib/validation/profile.ts` — Zod-Schema für die drei Felder, `https://`-Regel identisch zur Datenbank
- [x] `src/app/dashboard/profil/page.tsx` — eigene Route statt Abschnitt auf `/dashboard`
- [x] `src/components/dashboard/profile-form.tsx` — Client-Komponente mit `useActionState`, Zeichenzähler, Feldfehlern
- [x] Server Action `updateProfile(formData)` — `requireUserId()`, erneute Validierung, Update auf die eigene Zeile
- [x] `src/components/profile/avatar.tsx` — gemeinsame Komponente mit Initialen-Rückfall und Fehlerbehandlung beim Laden; wird auch in 08 verwendet
- [x] `revalidatePath('/dashboard')`, `revalidatePath('/dashboard/profil')` und `revalidatePath('/u/' + username)`
- [x] Zusätzlich: `src/components/dashboard/dashboard-nav.tsx` (Bereichswechsel), `src/lib/profile-form-state.ts` (Typen außerhalb der `"use server"`-Datei), `preview-placeholder.tsx` um den Kopfbereich erweitert

## Validation
> Durchgeführt am 14.08.2026, Prüfskripte unter `_Claude_Arbeit/cdp-testtreiber/spec07-profil/`.

- `npx tsc --noEmit` grün
- Klickpfad: Anzeigename und Bio eintragen → speichern → Bestätigung → Vorschau aktualisiert → öffentliche Seite im neuen Tab zeigt dieselben Werte
- Eingabeprüfung: Bio mit 301 Zeichen → Meldung; Bild-Adresse `http://beispiel.de/x.png` → Meldung, dass `https://` nötig ist
- Rückfall-Prüfung: alle Felder leeren → öffentliche Seite zeigt `@<username>` und den Initialen-Platzhalter
- Fehlerhaftes Bild: Adresse `https://beispiel.de/gibtsnicht.png` eintragen → Platzhalter erscheint, kein kaputtes Bildsymbol
- **RLS-Test:** Per SQL als zweiter Nutzer versuchen, das fremde Profil zu ändern → keine Zeile betroffen

## Relevante Rules/Skills
- `CLAUDE.md` Kernprinzip 2 und 3
- `rules/design-system.md` (Formulare, Focus-States)
- `references/design-analysis.md` Abschnitt 4 (Kopfbereich: Avatar 96 px, rund, zentriert; Name; Bio gedämpft)

## Status
✅ fertig

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief

- **Was lief gut:** Die Entscheidung, die Vorschau **beim Tippen** mitlaufen zu lassen statt erst nach dem Speichern, kostete keine Zusatzarbeit — der Eingabestand liegt ohnehin in der Klammer-Komponente — und macht das Kriterium „Vorschau übernimmt sofort" nebenbei sichtbar. Die Prüfregeln aus `validation/profile.ts` decken drei Zwecke ab: Formular, Server Action und die Frage, ob eine halbfertige Adresse in die Vorschau darf.
- **Was war unerwartet:** Zwei Dinge, die beide erst die Messung zeigte. (1) Ein `<textarea>` sendet `\r\n`; Postgres zählt das als zwei Zeichen, der Browser als eines — Zähler und Grenze wären auseinandergelaufen. (2) Ein 60 Zeichen langer Name ohne Leerzeichen sprengte den Telefon-Rahmen, weil `break-words` nur an Wortgrenzen bricht.
- **Was fließt in `learning.md`:** Der CRLF-Fallstrick, der Umbruch-Fallstrick und ein Messfehler: Ein zu grober Selektor (`button[type=submit]`) traf den Abmelden-Knopf in der Kopfzeile, was zunächst wie ein kaputter Auth-Flow aussah.
