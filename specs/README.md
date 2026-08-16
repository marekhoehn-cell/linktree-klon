# Specs — Feature-Spezifikationen

Dieser Ordner enthält die Feature-Specs des Linktree-Clone-Projekts. Eine Spec ist die
verbindliche Arbeitsgrundlage für genau ein Feature: Sie beschreibt, was gebaut wird,
wovon es abhängt, wann es fertig ist und wie das überprüft wird.

## Namenskonvention

```
specs/NN-<feature>.md
```

- `NN` = zweistellige, fortlaufende Nummer (`01`, `02`, `03`, …)
- `<feature>` = kurzer Kebab-Case-Name, z. B. `auth-email-passwort`, `link-crud`, `public-profile`
- Die Nummerierung folgt der **Abhängigkeitsreihenfolge**, nicht der Wichtigkeit:
  Was zuerst gebaut werden muss, bekommt die kleinere Nummer.

Beispiele für eine plausible Reihenfolge:

```
specs/01-datenmodell-supabase.md
specs/02-auth-email-passwort.md
specs/03-dashboard-shell.md
specs/04-link-crud.md
specs/05-drag-and-drop-sortierung.md
specs/06-theming.md
specs/07-public-profile-page.md
```

## Wie eine Spec benutzt wird

Der Build-Loop pro Spec ist immer derselbe: **Plan → Build → Check**.

1. **Plan** — Spec lesen, Abhängigkeiten prüfen (sind alle Specs mit kleinerer Nummer auf
   `✅ fertig`?). Tasks konkretisieren, falls beim Lesen Lücken auffallen. Status auf
   `🚧 in Arbeit` setzen.
2. **Build** — Tasks der Reihe nach abarbeiten und die Checkboxen direkt in der Spec
   abhaken. Nichts bauen, was unter *Out of Scope* steht — das gehört in eine eigene Spec.
3. **Check** — Den Abschnitt *Validation* ausführen: Build laufen lassen, im Browser
   prüfen, RLS-Regeln gegen einen zweiten Testuser testen. Erst wenn **alle**
   Akzeptanzkriterien abgehakt sind, geht der Status auf `✅ fertig`.
4. **Debrief** — Nach Abschluss ausfüllen: was lief gut, was war unerwartet, was fließt in
   `learning.md`. Das ist kein Bonus, sondern Teil der Definition of Done.

Den Status während der Arbeit pflegen, nicht erst am Ende — er ist der einzige
zuverlässige Fortschrittsindikator über Session-Grenzen hinweg.

## Spec-Template

Neue Spec anlegen = diesen Block kopieren, in `specs/NN-<feature>.md` einfügen, ausfüllen.

````markdown
# NN — <Feature-Name>

## Ziel
Ein bis drei Sätze: Was kann der Nutzer nach diesem Feature, was er vorher nicht konnte?
Aus Nutzersicht formuliert, nicht aus Technik-Sicht.

## Abhängigkeiten
- Specs, die vorher `✅ fertig` sein müssen (z. B. `01-datenmodell-supabase.md`)
- Externe Voraussetzungen (Supabase-Projekt angelegt, Env-Variablen gesetzt, Paket installiert)

## Out of Scope
Was in diesem Schritt bewusst NICHT gebaut wird — inkl. Verweis auf die Spec, die es später
abdeckt. Verhindert Scope Creep im Build.

## Akzeptanzkriterien
- [ ] Konkret prüfbare Aussage aus Nutzersicht
- [ ] Jede Zeile einzeln als "erfüllt / nicht erfüllt" entscheidbar
- [ ] Keine Formulierungen wie "funktioniert gut" oder "sieht sauber aus"

## Tasks
- [ ] Technischer Arbeitsschritt (Datei/Komponente/Migration konkret benennen)
- [ ] Nächster Schritt
- [ ] …

## Validation
Wie wird konkret geprüft, dass es funktioniert? Zum Beispiel:
- `npm run build` läuft ohne TypeScript-Fehler durch
- `npx tsc --noEmit` ist grün
- Manueller Klickpfad im Browser: Schritt 1 → Schritt 2 → erwartetes Ergebnis
- RLS-Check: Zweiter Testuser sieht die Daten des ersten Users NICHT

## Relevante Rules/Skills
- Skills, die für dieses Feature geladen werden sollen (z. B. `supabase`,
  `supabase-postgres-best-practices`)
- Projektregeln aus `CLAUDE.md`, die hier besonders greifen

## Status
⏳ offen

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief
Erst nach Abschluss ausfüllen.

- **Was lief gut:**
- **Was war unerwartet:**
- **Was fließt in `learning.md`:**
````

## Aktueller Stand

Die Specs wurden in **Phase 4** erzeugt (14.08.2026). Zehn Pakete, nummeriert nach
Abhängigkeit — die Übersicht mit Status steht in `implementierungsplan.md`.

| Spec | Hängt ab von |
|---|---|
| `01-datenmodell-ergaenzungen.md` | — |
| `02-auth-email-passwort.md` | 01 |
| `03-onboarding-username.md` | 01, 02 |
| `04-dashboard-shell.md` | 02, 03 |
| `05-link-crud.md` | 04 |
| `06-link-reordering.md` | 05 (+ Paket `motion` installieren) |
| `07-profil-section.md` | 04 |
| `08-public-profile-page.md` | 05, 07 |
| `09-theming-accent-color.md` | 08 |
| `10-deployment.md` | 01–09 |

Zwei Reihenfolge-Entscheidungen, die beim Lesen sonst überraschen:

- **08 vor 09:** Die öffentliche Seite entsteht zuerst mit der Standardfarbe. Erst danach
  kommt die Farblogik darauf — sonst baut man sie ohne sichtbare Wirkfläche.
- **07 hängt an 04, nicht an 05:** Profil-Felder und Link-Verwaltung sind unabhängig
  voneinander und könnten parallel gebaut werden.
