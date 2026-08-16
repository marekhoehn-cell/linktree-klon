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
- [x] `.env.local` steht in `.gitignore` und ist **nicht** im Commit enthalten
- [x] `.venv/` und `_Claude_Arbeit/` sind ausgeschlossen
- [x] Kein Schlüssel, kein Passwort und kein Token steht im Klartext in einer verfolgten Datei
- [x] `npm run build` läuft lokal fehlerfrei durch
- [x] `npx tsc --noEmit` ist grün
- [x] Kein `console.log` im Code (`rules/code-conventions.md`)

## Akzeptanzkriterien
- [x] Das Repository liegt auf GitHub, der Verlauf enthält keine Zugangsdaten
- [x] Das Projekt ist mit Vercel verbunden und der erste Build ist erfolgreich
- [x] `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` sind in Vercel hinterlegt — dazu `NEXT_PUBLIC_SITE_URL`, das in dieser Liste fehlte
- [x] Die Live-Seite ist erreichbar; Registrierung, Anmeldung, Link-Anlegen und die öffentliche Seite funktionieren dort
- [ ] ~~Die Supabase-Weiterleitungsadressen enthalten die Vercel-Domain~~ — **bewusst offen**, siehe „Abweichungen"
- [x] Ein Push auf den Hauptzweig löst ein neues Deployment aus
- [x] Ein Pull Request erzeugt eine Vorschau-Adresse
- [x] **E-Mail-Bestätigung in Supabase wieder eingeschaltet** — sie war nur für die Entwicklung aus (`guidelines.md` 005)
- [x] Die Anmeldung funktioniert auch nach dem Wiedereinschalten (Bestätigungsmail kommt an, Link führt zurück in die App)
- [x] `mcp__supabase__get_advisors` läuft ein letztes Mal; verbleibende Warnungen sind bewertet und dokumentiert

## Tasks
- [x] `.gitignore` gegen die Prüfliste oben abgleichen
- [x] `git status` vollständig durchsehen — jede Datei bewusst bestätigen
- [x] Ersten Commit mit aussagekräftiger Nachricht erstellen
- [x] Repository auf GitHub anlegen (privat oder öffentlich — bewusst entschieden: **öffentlich**) und pushen
- [x] Projekt in Vercel importieren, Umgebungsvariablen setzen, deployen
- [ ] ~~In Supabase unter Auth die Site-URL und die Redirect-URLs auf die Vercel-Domain setzen~~ — bewusst offen
- [x] Vollständigen Durchlauf auf der Live-Seite testen
- [x] E-Mail-Bestätigung aktivieren und den Registrierungsweg erneut testen
- [x] `README.md` um die Live-Adresse und eine kurze Anleitung zur lokalen Einrichtung ergänzen
- [x] `changelog.md` mit dem Release-Eintrag ergänzen

## Ergebnis

- Repository: **https://github.com/marekhoehn-cell/linktree-klon** (public)
- Live: **https://linktree-klon-taupe.vercel.app**
- Commits: `cf0e0fa` (Initial Build, 168 Dateien), `f138bfe` (Theme-Backup entfernt)
- Datenbank vor dem Release geleert: alle fünf Testkonten raus, 0 users / 0 profiles / 0 links

### Abweichungen

**Supabase Site-URL bleibt auf `http://localhost:3000`.** Marek hat entschieden, sie nicht umzustellen: Das Projekt bleibt ein Test, und die lokale Entwicklung müsste sonst mitwandern. Folge, die man kennen muss: Der Bestätigungslink in Mails aus der Live-Umgebung zeigt auf localhost. Wer das Deployment ernsthaft nutzen will, stellt Site-URL und Redirect-URLs zuerst um.

**Advisor-Warnungen — bewertet, bleiben bestehen:**
- `auth_leaked_password_protection` (WARN, Security): Abgleich gegen HaveIBeenPwned ist aus. Nur im Dashboard einschaltbar, das MCP schreibt keine Auth-Einstellungen. Nicht blockierend, die Mindestlänge erzwingt Zod serverseitig.
- `multiple_permissive_policies` auf `public.links` (WARN, Performance): vorbestehend und gewollt — `links_select_own` und `links_select_public_active` decken zwei verschiedene Fälle ab.

**Noch offen aus früheren Paketen:** CSP-Header aus `guidelines.md` 004, 5 restliche `bg-gradient-to-b` → `bg-linear-to-b`, `src/app/icon.tsx`.

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
✅ fertig (16.08.2026)

<!-- ⏳ offen / 🚧 in Arbeit / ✅ fertig -->

## Debrief

- **Was lief gut:** Der erste Commit war unspektakulär, weil `.gitignore` schon in der Aufräumrunde vorbereitet war — `.env.local`, `.venv/`, `_Claude_Arbeit/` und `.claude/settings.local.json` waren von Anfang an draußen, der Secret-Scan über die gestagten Dateien blieb leer. Die Trennung „Deliverables im Projektroot, Arbeitsstände in `_Claude_Arbeit/`" hat sich beim ersten Commit ausgezahlt: Es musste nichts nachträglich aussortiert werden. Der Vercel-Import und die Live-Tests liefen ohne Nacharbeit.
- **Was war unerwartet:** Drei Dinge. (1) Der Push landete auf dem falschen GitHub-Account, weil `gh` noch eine Altsitzung hielt — das fällt erst auf, wenn man die Repo-URL liest. (2) Danach scheiterte der Push mit **„Repository not found"**, obwohl das Repo existierte: Der Windows Credential Manager lieferte weiter das alte Token, und GitHub antwortet bei privaten Repos mit 404 statt mit einer Rechte-Meldung. Die Meldung zeigt also auf das falsche Problem. (3) Die Env-Liste im `README.md` war seit AP 02 falsch (`NEXT_PUBLIC_SUPABASE_ANON_KEY` statt `..._PUBLISHABLE_KEY`) und `NEXT_PUBLIC_SITE_URL` fehlte ganz — beides fiel erst beim Schreiben der Deployment-Doku auf, weil vorher nie jemand das Setup aus dem README heraus nachgebaut hat.
- **Was fließt in `learning.md`:** „Repository not found" bei einem existierenden privaten Repo ist ein Credential-Problem, kein Namensproblem — erst `gh auth status` und `git config --get-all credential.helper` prüfen, nicht den Repo-Namen suchen. Und: Doku, die niemand nachvollzieht, veraltet unbemerkt; die Env-Liste im README gehört gegen den Code geprüft, sobald sich ein Variablenname ändert.
