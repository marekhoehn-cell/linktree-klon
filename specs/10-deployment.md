# 10 — Deployment: Git, GitHub, Vercel

## Ziel
Das Projekt liegt versioniert auf GitHub und ist unter einer öffentlichen Adresse erreichbar. Jeder Push auf den Hauptzweig erzeugt eine neue Version, jeder Pull Request eine Vorschau-Umgebung.

## Abhängigkeiten
- Pakete `01`–`09` ✅ — alle Akzeptanzkriterien abgehakt
- GitHub-Konto, Vercel-Konto (beide kostenlos)

## Wichtig: erst hier wird committet
`CLAUDE.md` Kernprinzip 4 gilt bis zu diesem Paket: **vorher wird nichts committet oder gepusht.** Der erste Commit umfasst damit den gesamten bisherigen Stand. Das ist kein Versehen, sondern die Vorgabe des Kursaufbaus.

## Out of Scope
- Eigene Domains (dauerhaft draußen)
- CI-Pipelines, automatische Tests im Build
- Staging-Umgebung neben der Produktion

## Vor dem ersten Commit prüfen
- [ ] `.env.local` steht in `.gitignore` und ist **nicht** im Commit enthalten
- [ ] `.venv/` und `_Claude_Arbeit/` sind ausgeschlossen
- [ ] Kein Schlüssel, kein Passwort und kein Token steht im Klartext in einer verfolgten Datei
- [ ] `npm run build` läuft lokal fehlerfrei durch
- [ ] `npx tsc --noEmit` ist grün
- [ ] Kein `console.log` im Code (`rules/code-conventions.md`)

## Akzeptanzkriterien
- [ ] Das Repository liegt auf GitHub, der Verlauf enthält keine Zugangsdaten
- [ ] Das Projekt ist mit Vercel verbunden und der erste Build ist erfolgreich
- [ ] `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sind in Vercel hinterlegt
- [ ] Die Live-Seite ist erreichbar; Registrierung, Anmeldung, Link-Anlegen und die öffentliche Seite funktionieren dort
- [ ] Die Supabase-Weiterleitungsadressen enthalten die Vercel-Domain
- [ ] Ein Push auf den Hauptzweig löst ein neues Deployment aus
- [ ] Ein Pull Request erzeugt eine Vorschau-Adresse
- [ ] **E-Mail-Bestätigung in Supabase wieder eingeschaltet** — sie war nur für die Entwicklung aus (`guidelines.md` 005)
- [ ] Die Anmeldung funktioniert auch nach dem Wiedereinschalten (Bestätigungsmail kommt an, Link führt zurück in die App)
- [ ] `mcp__supabase__get_advisors` läuft ein letztes Mal; verbleibende Warnungen sind bewertet und dokumentiert

## Tasks
- [ ] `.gitignore` gegen die Prüfliste oben abgleichen
- [ ] `git status` vollständig durchsehen — jede Datei bewusst bestätigen
- [ ] Ersten Commit mit aussagekräftiger Nachricht erstellen
- [ ] Repository auf GitHub anlegen (privat oder öffentlich — bewusst entscheiden) und pushen
- [ ] Projekt in Vercel importieren, Umgebungsvariablen setzen, deployen
- [ ] In Supabase unter Auth die Site-URL und die Redirect-URLs auf die Vercel-Domain setzen
- [ ] Vollständigen Durchlauf auf der Live-Seite testen
- [ ] E-Mail-Bestätigung aktivieren und den Registrierungsweg erneut testen
- [ ] `README.md` um die Live-Adresse und eine kurze Anleitung zur lokalen Einrichtung ergänzen
- [ ] `changelog.md` mit dem Release-Eintrag ergänzen

## Validation
- **Geheimnis-Prüfung:** `git log -p | grep -iE "SUPABASE|SECRET|PASSWORD|sb_"` → kein Treffer mit einem echten Wert
- Live-Durchlauf in einem privaten Fenster: registrieren → Username wählen → zwei Links anlegen → umsortieren → Farbe ändern → abmelden → öffentliche Seite ohne Anmeldung aufrufen → alles wie lokal
- Push-Test: kleine Änderung auf den Hauptzweig pushen → Vercel baut automatisch, Änderung ist live
- Pull-Request-Test: Zweig anlegen, PR öffnen → Vorschau-Adresse erscheint und funktioniert
- Nach dem Aktivieren der E-Mail-Bestätigung: neu registrieren → Bestätigungsmail kommt an → Link führt in die App → Anmeldung möglich
- Mobil: die Live-Seite auf einem echten Telefon aufrufen und die Sortierung testen

## Relevante Rules/Skills
- `rules/tech-stack.md` (Befehle), `rules/verification.md` (Deployment)
- `CLAUDE.md` Kernprinzip 4 und die Regel „Secrets nie im Klartext"
- `guidelines.md` 001 (Vercel-Entscheidung) und 005 (E-Mail-Bestätigung)

## Status
⏳ offen

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief
Erst nach Abschluss ausfüllen.

- **Was lief gut:**
- **Was war unerwartet:**
- **Was fließt in `learning.md`:**
