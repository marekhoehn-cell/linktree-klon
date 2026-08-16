# Learning — Debriefs

Log der Debriefs nach Arbeitspaketen. Zweck: dieselbe Sackgasse nicht zweimal betreten. Hier steht nicht, *was* gebaut wurde (das ist `changelog.md`), sondern **was die Zusammenarbeit mit dem Agenten gelehrt hat**.

## Format

```
## YYYY-MM-DD — <Kontext: Arbeitspaket / Spec / Situation>
- Was passierte: <was schiefging oder überraschte — sachlich, ohne Beschönigung>
- Ursache: <woran es tatsächlich lag>
- Konsequenz: <was in der nächsten Runde anders läuft — konkret genug, um es zu befolgen>
```

Regeln:
- Auch **positive Überraschungen** notieren: Ein Prompt oder Vorgehen, das unerwartet gut funktioniert hat, ist genauso wertvoll wie ein Fehler.
- Die **Konsequenz** ist der eigentliche Wert des Eintrags. Wenn sie eine Dauerregel beschreibt, gehört sie zusätzlich in die passende Datei unter `rules/` — hier bleibt dann der Verweis stehen.
- Nichts glätten. Ein Eintrag „Agent hat drei Runden am falschen Problem gearbeitet, weil die Spec unklar war" ist nützlich; „lief gut" ist es nicht.

## Einträge

## 2026-08-15 — Landingpage auf „/" (Zusatzpaket)
- Was passierte: Der Lichtschein hinter dem Hero war im ersten Durchgang schlicht nicht da. Die Fläche wirkte flach grau — genau das, was `rules/design-system.md` Regel 2 verbietet. Der Quelltext sah dabei völlig korrekt aus, das Muster war 1:1 aus `auth-shell.tsx` übernommen.
- Ursache: `-z-10` an einem Kind, dessen Elternelement selbst einen `bg-gradient-to-b` trägt. Der Elternteil bildet ohne eigenen `z-index` **keinen** Stacking-Context, das Kind landet also im Kontext des Roots — und der Elternhintergrund wird darüber gemalt. Der Schein lag hinter der Fläche, die ihn zeigen sollte.
- Konsequenz: Ein Lichtschein-Div bekommt **kein** negatives `z-index`, wenn sein Container eine eigene Hintergrundfarbe oder einen Verlauf hat. Stattdessen: Schein auf Ebene 0 als erstes Kind, Inhalt darüber per `relative`. Und: `auth-shell.tsx:10` hat denselben Fehler — der Schein ist dort auf Login, Sign-up und Onboarding ebenfalls unsichtbar (vermerkt in `_Claude_Arbeit/offene-punkte.md`). Ein aus dem Projekt kopiertes Muster ist kein Beweis dafür, dass das Muster funktioniert.

- Was passierte: Zwei Messungen lieferten Unsinn und hätten fast zu falschen Schlüssen geführt. Erstens meldete die Schatten-Prüfung `rgba(0, 0, 0, 0) 0px 0px 0px 0px` und sah nach „gar kein Schatten" aus. Zweitens ergab die selbstgebaute WCAG-Kontrastrechnung ein Verhältnis von 1,0 — rechnerisch ein unsichtbarer Text.
- Ursache: Erstens setzt Tailwind v4 `box-shadow` aus fünf Teilen zusammen (`inset-shadow`, `inset-ring`, `ring-offset`, `ring`, `shadow`); die ersten vier sind transparente Platzhalter, der echte Schatten steht am **Ende** — mein `.slice(0, 90)` schnitt genau ihn ab. Zweitens liefert Chrome Farben je nach Token als `lab()` bzw. `oklab()`; mein Parser las die Zahlen, als wären es RGB-Werte.
- Konsequenz: `boxShadow` nie kürzen, sondern die transparenten Platzhalter herausfiltern und den Rest vollständig ausgeben. Farbmessungen in diesem Projekt nicht selbst nachrechnen — `getComputedStyle` gibt hier keine RGB-Werte zurück. Für Kontrastfragen ist ein vergrößerter Screenshot-Ausschnitt (`Page.captureScreenshot` mit `clip` und `scale`) die schnellere und ehrlichere Antwort; ein Vergleich der Farbwerte mit einem bereits abgenommenen Element derselben Art schlägt jede eigene Formel.

- Was passierte: Ein Screenshot bei `deviceScaleFactor: 1` zeigte die CTA-Beschriftung im Dark Mode blass und verwaschen, im selben Durchgang war sie auf 390 px (Faktor 2) gestochen scharf. Das kostete einen kompletten Prüf-Durchgang für ein Problem, das es nicht gab.
- Ursache: Screenshot-Artefakt der Schriftglättung bei einfacher Auflösung, nicht das Rendering. Dazu kam ein selbstverschuldeter Fehler: `Page.addScriptToEvaluateOnNewDocument` setzte die `dark`-Klasse zwar, aber der Prüfaufruf lief trotzdem im Light Mode — ohne Kontrollausgabe fiel das erst am hellen Hintergrund des Bildes auf.
- Konsequenz: Beurteilungen der Schriftqualität nur bei `deviceScaleFactor: 2` oder im gezoomten Ausschnitt. Und jedes Skript, das einen Modus umschaltet (Dark, Emulation, Session), gibt den tatsächlich erreichten Zustand mit aus — sonst prüft man ungewollt den Ausgangszustand und hält das Ergebnis für echt.

- Was passierte: Positiv — der letzte offene Test (Redirect für eingeloggte Besucher) brauchte keine Rückfrage und kein neu angelegtes Wegwerf-Konto. Das Passwort des Testkontos `spec06tester` stand seit AP 08 in `_Claude_Arbeit/offene-punkte.md`.
- Ursache: Eine frühere Session hatte es dort bewusst notiert, statt es nach dem Test verfallen zu lassen.
- Konsequenz: Zugangsdaten von Testkonten gehören in `_Claude_Arbeit/offene-punkte.md`, solange die Konten in der DB stehen — sie ersparen der nächsten Session einen kompletten Registrierungsdurchlauf samt Aufräumarbeit. Beim Aufräumen vor Spec 10 verschwinden Konten **und** Notiz gemeinsam.

## 2026-08-15 — Impressum + Fußzeile (Zusatzpaket)
- Was passierte: Der Start von `browser-use` scheiterte zweimal, erst mit `uv trampoline failed to spawn Python child process (os error 4551)`, dann im Klartext mit „Eine Anwendungssteuerungsrichtlinie hat diese Datei blockiert". Der Eintrag aus AP 09 sagte, das System-Python helfe nicht, weil dort `websockets` fehlt — das stimmt so nicht.
- Ursache: Smart App Control (`VerifiedAndReputablePolicyState = 1`) blockiert die **kopierte, unsignierte** `.venv\Scripts\python.exe` samt aller uv-Trampolin-`.exe`. Das signierte System-Python aus `AppData\Local\Programs\Python\Python312` läuft dagegen — und es braucht keine eigene Installation, weil `PYTHONPATH` auf `\.venv\Lib\site-packages` zeigen kann. Die Pakete liegen bereits dort.
- Konsequenz: Aufruf ab jetzt `$env:PYTHONPATH = '<projekt>\.venv\Lib\site-packages'; Get-Content skript.py | python -c "from browser_use.cli import main; main()"` (PowerShell, nicht Git-Bash — dort scheitert schon der Interpreter-Start). Damit ist die volle browser-use-Helper-Bibliothek nutzbar, der Node-Ersatztreiber aus AP 09 wird nur noch gebraucht, wenn ganz ohne Python gearbeitet wird.

- Was passierte: Zwei Fallen beim JS-Code, der per `js(...)` durch den CDP-Kanal geht. Erstens brach ein Regex `replace(/\n/g, ' | ')` mit „Invalid regular expression" ab. Zweitens meldete ein per `element.focus()` gesetzter Fokus `:focus-visible = false`, obwohl der Ring korrekt definiert war.
- Ursache: Erstens wandelt Python das `\n` in einem normalen String in einen echten Zeilenumbruch um — im Browser kam ein zerrissener Regex an. Zweitens ist `:focus-visible` an die **Eingabemodalität** gebunden: Ein programmatischer Fokus zählt als Maus-Interaktion, nur echte Tastatureingabe löst ihn aus.
- Konsequenz: JS-Schnipsel für `js(...)` immer als Python-Raw-String (`r"""…"""`) schreiben. Und Focus-States ausschließlich über echte `press_key("Tab")`-Anschläge prüfen, nie über `.focus()` — sonst meldet die Messung fälschlich einen fehlenden Ring. (Deckt sich mit dem Fehlalarm aus AP 04, den Marek damals im Browser widerlegen musste.)

## 2026-08-15 — AP 09: Accent-Color
- Was passierte: Die Link-Karten blieben nach dem Umbau durchsichtig, obwohl `bg-brand` im Quelltext stand. Im DOM fehlte die Klasse ersatzlos.
- Ursache: `cn()` läuft über `tailwind-merge`. Die Karte trug zusätzlich `bg-gradient-to-b` — den **Tailwind-v3-Namen**. `tailwind-merge` kennt in v4 nur `bg-linear-to-b` und stuft den alten Namen als Hintergrund*farbe* ein; von zwei vermeintlichen Farbklassen gewinnt die letzte, `bg-brand` flog raus.
- Konsequenz: In diesem Projekt nur v4-Namen verwenden (`bg-linear-*`, `bg-radial-*`). Wo eine Farbklasse und eine Verlaufsklasse zusammen an `cn()` gehen, nach dem Umbau **im DOM** nachsehen, ob beide überlebt haben — der Quelltext beweist es nicht. Achtung: `bg-gradient-to-b` steht noch an mehreren Stellen im Projekt (u. a. `profile-workspace.tsx`, `avatar.tsx`); dort schadet es derzeit nicht, weil die Klassen als Literal ohne `cn()` gesetzt werden.

- Was passierte: Der Kartenrahmen sollte aus der automatisch bestimmten Textfarbe gemischt werden und war bei schwarzer Schrift trotzdem weiß.
- Ursache: `--brand-border: color-mix(in oklab, var(--brand-foreground) 20%, transparent)` stand in `:root`. Der Wert einer Custom Property wird **dort** aufgelöst, wo sie deklariert ist — die Überschreibung von `--brand-foreground` weiter unten im Baum erreicht ihn nicht mehr. Vererbt wird das fertige Ergebnis, nicht die Rechenvorschrift.
- Konsequenz: Abgeleitete Töne, die einer pro Seite überschriebenen Variablen folgen sollen, gehören in `@theme inline` (oder direkt an die Nutzungsstelle). Nur dort wird der `color-mix()`-Ausdruck in die Utility eingesetzt und erst am Element ausgerechnet. Faustregel: `color-mix()` in `:root` ist statisch, `color-mix()` in einer Utility ist dynamisch.

- Was passierte: Die vorhandenen CDP-Prüfskripte (Python, `.venv`) ließen sich nicht starten — Windows meldete „Eine Anwendungssteuerungsrichtlinie hat diese Datei blockiert" für `.venv\Scripts\python.exe`. Auch das System-Python half nicht, weil `websockets` dort fehlt und eine Installation an der Internet-Nachfrage hängt.
- Ursache: Application Control greift auf Interpreter in Benutzerverzeichnissen; das war in den Vorrunden noch nicht so.
- Konsequenz: Der Treiber liegt jetzt zusätzlich als `cdp.mjs` in Node vor (`_Claude_Arbeit/cdp-testtreiber/spec09-accent/`). Node 24 bringt `WebSocket` global mit — kein Paket, keine Installation, keine Richtlinien-Kollision. Für künftige Verifikationen dieser Treiber statt der Python-Variante nehmen.

- Was passierte: Die Regressionsprüfung „Ghost-Hover bleibt neutral" suchte nach `hover:bg-accent` und fand nichts — der erste Durchlauf meldete fälschlich „kein Element gefunden".
- Ursache: Die Ghost-Variante in `src/components/ui/button.tsx` nutzt in diesem Projekt `hover:bg-muted`, nicht den shadcn-Standard `hover:bg-accent`.
- Konsequenz: Regressionstests gegen die **tatsächliche** Klasse im Projekt schreiben, nicht gegen die Standardvariante der Bibliothek. Nebenbei ist die Entscheidung aus `guidelines.md` 004 damit noch stabiler als gedacht: `--accent` wird im Dashboard aktuell von keinem einzigen Element genutzt.

- Was passierte: Der DB-Sicherheitstest schien mit dem abgelehnten `update` erledigt — der Constraint `profiles_accent_color_check` warf sauber `23514`. Der eigentliche Prüfgegenstand des Akzeptanzkriteriums war damit aber gar nicht berührt.
- Ursache: Solange die erste Verteidigungslinie hält, erreicht der bösartige Wert die Anwendung nie. Über die zweite Linie — `safeAccent()` beim Rendern — sagt ein abgelehntes `update` exakt nichts aus.
- Konsequenz: Für einen belastbaren Defense-in-Depth-Test die äußere Schicht kurzzeitig entfernen (Constraint droppen), den Wert wirklich in die Zeile schreiben, die Seite abrufen und danach sofort wiederherstellen. Hier lieferte `/u/spec04tester` HTTP 200 mit `--brand:#6366f1`, ohne `position:fixed`, ohne `example.com`, ohne `<style>`-Tag. Testprofil statt des eigenen Accounts verwenden und den Ausgangszustand vorher per `select` sichern.

## 2026-08-14 — AP 08: Öffentliche Profilseite

- Was passierte: Die Meta-Beschreibung fehlte auf der Profilseite **ersatzlos** im Quelltext — `description`, `og:description` und `twitter:description` waren schlicht nicht da, während `og:title` und `og:image` sauber standen. Der Build meldete nichts, und auf einer zweiten Profilseite funktionierte alles.
- Ursache: Die Bio des Testkontos enthält einen Zeilenumbruch. Next rendert mehrzeilige Meta-Beschreibungen nicht — es lässt das Tag weg, statt zu warnen oder zu escapen.
- Konsequenz: Jeder Wert, der aus einem mehrzeiligen Feld in `metadata` wandert, wird vorher auf eine Zeile normalisiert (`replace(/\s+/g, " ").trim()`) und gekürzt. Und generell: Nach `generateMetadata()` **den ausgelieferten Quelltext ansehen**, nicht nur den Code — ein fehlendes Tag fällt sonst nirgends auf.

- Was passierte: Der Hover-Versatz der Link-Karten war als weicher Übergang gedacht, wäre aber ein harter Sprung gewesen. Sichtbar wurde das nur, weil das Prüfskript `getComputedStyle().transform` auslas und dort `none` stand — obwohl die Karte sich sichtbar bewegte.
- Ursache: Tailwind v4 setzt `-translate-y-0.5` auf die eigenständige CSS-Property `translate`, nicht mehr auf `transform`. Die Transition nannte `transform` und lief damit ins Leere.
- Konsequenz: Bei `transition-[…]` mit ausgewählten Properties unter Tailwind v4 immer `translate`/`scale`/`rotate` schreiben, nicht `transform`. Und Bewegungszustände messen statt ansehen — ein 2-px-Sprung ohne Übergang sieht auf einem Screenshot exakt aus wie einer mit.

- Was passierte: Die Link-Karten sahen als verzogene Kapseln aus, obwohl die vorgeschriebene Klasse `rounded-2xl` gesetzt war.
- Ursache: Das tweakcn-Theme setzt `--radius: 1.25rem`, wodurch `--radius-2xl` bei 36 px landet — mehr als die halbe Kartenhöhe von 60 px. Der Browser skaliert die Radien dann proportional herunter, und die Form kippt.
- Konsequenz: Klassennamen aus einer Design-Vorgabe sind keine Zusicherung über den tatsächlichen Wert. Bei Radius, Abstand und Schatten den **gemessenen** Wert gegen die Vorgabe halten, nicht den Klassennamen. Faustregel: Radius > halbe Höhe heißt, die Vorgabe passt nicht zum Element.

- Was passierte: Die Route für das Open-Graph-Bild antwortete mit 500, der Fehler lautete `Expected <div> to have explicit "display: flex" … if it has more than one child node`.
- Ursache: Satori (die Bild-Erzeugung hinter `next/og`) kennt kein Standard-Block-Layout. `@{username}` im JSX sind zwei Kinder, ebenso Text plus angehängtes Auslassungszeichen — beides reichte.
- Konsequenz: In `opengraph-image.tsx` Texte **fertig zusammensetzen** und als einzelnen Ausdruck übergeben. Außerdem: Die Bild-Route wird von keinem Typecheck und keinem Build erfasst — sie muss einmal wirklich abgerufen werden, sonst fällt der Fehler erst beim ersten geteilten Link auf.

- Was passierte: Positive Überraschung — die Entscheidung, die öffentliche Seite und die Dashboard-Vorschau aus **einer** Komponente zu rendern, hat sich sofort ausgezahlt. Weil der Telefon-Rahmen innen ~390 px breit ist, brauchte die Vorschau keine eigene Typografie oder Größenstaffelung.
- Ursache: Der Rahmen wurde in AP 04 bewusst auf echte Gerätebreite gebaut. Dadurch ist „Vorschau" hier keine Nachbildung, sondern dieselbe Seite in einem Rahmen.
- Konsequenz: Wenn eine Vorschau existiert, den Vorschau-Container von Anfang an auf die echte Zielbreite legen. Der Unterschied darf sich dann auf Verhalten beschränken (hier: Klickbarkeit und Leerzustand über eine `variant`-Prop), nicht auf Aussehen.

## 2026-08-14 — AP 07: Profil-Section

- Was passierte: Nach dem ersten automatisierten Speichern stand der Browser auf `/login`, in der Datenbank hatte sich nichts geändert. Das sah nach einem kaputten Auth-Pfad in der neuen Server Action aus.
- Ursache: Das Prüfskript klickte `document.querySelector('button[type=submit]')` — und der erste Submit-Knopf im DOM ist „Abmelden" in der Kopfzeile. Das Server-Log zeigte es eindeutig: `signOut()` statt `updateProfile()`.
- Konsequenz: In Prüfskripten nie global nach Rollen-Selektoren greifen, sondern vom bekannten Feld ausgehen (`#displayName.closest('form')`). Und: Bei einem unerklärlichen Auth-Sprung **zuerst** ins Dev-Server-Log sehen — dort steht der Name der tatsächlich ausgeführten Server Action, das kostet einen Aufruf und beendet die Spekulation sofort.

- Was passierte: Der Zeichenzähler zeigte 36 Zeichen, in der Datenbank standen 38.
- Ursache: Ein `<textarea>` sendet Zeilenumbrüche laut HTML-Spezifikation als `\r\n`, Postgres' `char_length` zählt beide Zeichen. An der 300er-Grenze hätte der Nutzer „300 / 300" gesehen und trotzdem eine Fehlermeldung bekommen.
- Konsequenz: Bei jedem mehrzeiligen Feld mit Längenbegrenzung die Umbrüche **vor** Prüfung und Speicherung auf `\n` normalisieren, und die Zählung im Client identisch machen. Ebenso zählt `String.prototype.length` UTF-16-Einheiten (ein Emoji = 2), `char_length` dagegen Codepoints — deshalb `[...wert].length`.

- Was passierte: Ein 60 Zeichen langer Anzeigename ohne Leerzeichen schob den Telefon-Rahmen der Vorschau auf und erzeugte darin einen horizontalen Scrollbalken.
- Ursache: `break-words` (`overflow-wrap: break-word`) bricht nur, wenn es eine Wortgrenze gibt. Ein einzelnes überlanges „Wort" bleibt am Stück.
- Konsequenz: Für jedes Feld, dessen Inhalt vom Nutzer kommt und in einen schmalen Container läuft, `overflow-wrap: anywhere` verwenden — und den Grenzfall „maximale Länge, keine Leerzeichen" mitprüfen, nicht nur realistische Beispieltexte.

## 2026-08-14 — AP 06: Sortierung per Drag-and-Drop und Tastatur

- Was passierte: Die Verifikation meldete zunächst „Ziehen am Griff funktioniert nicht" — kein `data-dragging`, keine Umsortierung, 0 Server-Aufrufe. Der Mitbauende zog dann von Hand und es funktionierte sofort.
- Ursache: Motion startet das Ziehen über `setPointerCapture`, und darauf reagieren nur echte Eingabe-Events des Betriebssystems. Über das DevTools-Protokoll injizierte Maus-Events (`Input.dispatchMouseEvent`) lösen es nicht aus. Der Befund war eine Eigenschaft des Messwerkzeugs, nicht des Codes.
- Konsequenz: Bei einem negativen Automatisierungsbefund immer erst eine **Gegenprobe an unbeteiligter Stelle** fahren, bevor er als Fehler gemeldet wird. Für Motion-Drag gilt: `Input.dispatchTouchEvent`-Sequenzen funktionieren, synthetische Maus-Events nicht — und für den Maus-Pfad ist ein manueller Zug plus serverseitige Messung (Netzwerk-Mitschnitt, DB-Stand) der verlässliche Weg.

- Was passierte: Derselbe Fehler ein zweites Mal, mit umgekehrtem Vorzeichen: Das Pflicht-Kriterium „Wischen über den Karten scrollt" wurde als **durchgefallen** gemeldet, obwohl die Seite scrollbar war.
- Ursache: `Input.synthesizeScrollGesture` wirkt in dieser Emulation überhaupt nicht — auch weit außerhalb der Liste, etwa über der Überschrift, blieb `scrollY` bei 0. Mit `Input.dispatchTouchEvent`-Sequenzen scrollte dieselbe Seite sofort um 389 px.
- Konsequenz: Ein negatives Ergebnis ist erst dann ein Befund, wenn dieselbe Messung an einer Stelle **ohne** die verdächtige Ursache ein positives Ergebnis liefert. Diese Gegenprobe kostet einen Aufruf und hat hier zweimal eine Falschmeldung verhindert.

- Was passierte: `useOptimistic` und Drag-and-Drop ließen sich nicht direkt verbinden. Wird jede Zwischenreihenfolge in einer normalen Transition angewandt, springt die Karte mitten im Ziehen zurück.
- Ursache: React verwirft den optimistischen Stand am Ende der auslösenden Transition. Während eines Zuges läuft aber noch keine Server-Anfrage, die die Transition offen hielte — und die Spec verbietet ein zweites `useState` daneben.
- Konsequenz: Muster für alle künftigen Drag-Interaktionen: Jede Zwischenreihenfolge läuft in einer eigenen Transition, die über ein offenes Versprechen bis zum Loslassen gehalten wird. `onDragEnd` legt die Endreihenfolge auf den Stapel und gibt **erst danach** alle Haltungen frei, sonst blitzt ein Zwischenstand auf. Der Reducer bekommt nur IDs, keine Link-Objekte — sonst schleppt eine wiederholt angewandte Aktion veraltete Daten mit.

- Was passierte: Die Drag-Hervorhebung über `data-[dragging=true]:shadow-xl` und `:z-20` blieb wirkungslos, während `data-[dragging=true]:border-ring` an derselben Karte griff.
- Ursache: Motion setzt Ebene und Transform des gezogenen Items per Inline-Style. Die Gegenprobe zeigte, dass an diesem Element selbst ein von Hand gesetztes `element.style.boxShadow` nicht wirksam wurde — Motion kontrolliert diese Properties vollständig.
- Konsequenz: Optische Zustände eines Motion-gesteuerten Elements gehören in `whileDrag`/`animate`, nicht in Utility-Klassen. Design-Tokens funktionieren dort als `var(--shadow-xl)`, es braucht keine rohen Farbwerte in der Komponente.

- Was passierte: Ein per SQL in `auth.users` angelegter Test-User konnte sich nicht anmelden — „E-Mail oder Passwort ist falsch", obwohl `crypt('...', encrypted_password) = encrypted_password` in der Datenbank `true` ergab.
- Ursache: Die Token-Spalten (`confirmation_token`, `recovery_token`, `email_change_token_new`/`_current`, `email_change`, `phone_change`, `phone_change_token`, `reauthentication_token`) standen auf `NULL`. GoTrue liest sie als nicht-nullable Strings und bricht ab, meldet das aber als Anmeldefehler.
- Konsequenz: Test-User per SQL immer mit diesen Spalten auf `''` anlegen, dazu `email_confirmed_at` setzen und einen passenden Eintrag in `auth.identities` (`provider = 'email'`) erzeugen. Das umgeht das Free-Tier-Mailkontingent vollständig — der in `learning.md` (AP 02) dokumentierte Rate-Limit-Ärger lässt sich so künftig vermeiden.

## 2026-08-14 — AP 05: Link-CRUD
- Was passierte: Der geforderte Offline-Test schlug fehl, aber anders als erwartet: Der optimistische Eintrag verschwand wortlos wieder, ein Toast erschien nie. Der Code sah korrekt aus (`if (!result.ok) toast.error(...)`).
- Ursache: Ist der Server nicht erreichbar, liefert ein Server-Action-Aufruf **kein** `{ ok: false }` — er wirft eine Exception. Die Prüfung des Rückgabewerts wurde dadurch nie erreicht, und `useOptimistic` rollte beim Abbruch der Transition korrekt zurück. Die Fehlerbehandlung existierte nur für den Pfad, den der Server selbst beantworten kann.
- Konsequenz: Jeder Aufruf einer Server Action aus einer Client-Komponente braucht **beides** — die Prüfung des Rückgabewerts *und* ein `try/catch`. Gilt für alle folgenden Specs. Und: Ein Fehlerpfad, der nicht künstlich ausgelöst wurde, gilt als ungetestet — der Test hätte ihn beinahe bestätigt, weil die Liste ja „richtig" zurücksprang.

- Was passierte: Der RLS-Test bestand, aber die Begründung des Akzeptanzkriteriums stimmte nicht. „Ein zweiter Testnutzer sieht die Links des ersten nicht" wird **nicht** von RLS getragen.
- Ursache: Die Policy `links_select_public_active` erlaubt `authenticated` **und** `anon` das Lesen aller Zeilen mit `is_active = true` — das braucht die öffentliche Seite in AP 08 so. Policies sind ODER-verknüpft, `links_select_own` schränkt also nichts ein. Dass im Dashboard nur eigene Links erscheinen, garantiert allein der Filter `eq("user_id", …)` in `getLinks()`.
- Konsequenz: Bei jedem RLS-Test zwischen Lese- und Schreibschutz trennen und beides einzeln nachweisen. Schreibzugriffe sind hier echt abgesichert (0 Zeilen bzw. Fehler 42501), Leseschutz auf `links` gibt es bewusst nicht. Wo eine Abfrage sich auf einen `eq`-Filter verlässt statt auf RLS, gehört das als Kommentar an die Abfrage — sonst entfernt es später jemand als „redundant".

- Was passierte: Positive Überraschung — der komplette Klickpfad lief deterministisch ohne LLM-Agenten, obwohl `browser-use` beim Verbinden hängen blieb.
- Ursache: `browser_use.Browser.start()` blockierte gegen den laufenden Chrome (der auf Port 9222 keine DevTools-Endpunkte anbot, vermutlich `--remote-debugging-pipe`). Ein zweiter Chrome mit eigenem `--user-data-dir` und `--remote-debugging-port=9333`, angesprochen über rohes CDP (`requests` + `websockets`, ~60 Zeilen), war schneller aufgesetzt als die Fehlersuche an der Bibliothek.
- Konsequenz: Für Klickpfade ab jetzt direkt der schlanke CDP-Treiber (`cdp.py` im Scratchpad) statt `browser-use`. Wichtig dabei: Text-Selektoren sind mehrdeutig, sobald derselbe Beschriftungstext zweimal im DOM steht („Link hinzufügen" als Kopfzeilen- **und** Absende-Schaltfläche) — für den Dialog `[data-slot=dialog-content] button[type=submit]` verwenden. Und Sonner rendert seine Toasts in ein `<section><li>`, was einen `section li`-Selektor für die Linkliste verfälscht.

- Was passierte: `npx shadcn add sonner` zog `next-themes` als Dependency mit, obwohl das Projekt keinen Theme-Provider hat.
- Ursache: Die shadcn-Vorlage liest das Theme über `useTheme()`. Ohne Provider fällt der Wert still auf `"system"` zurück — es kracht nicht, aber eine unbenutzte Dependency und eine Farbquelle, die nicht zur App passt, bleiben zurück.
- Konsequenz: Nach jedem `shadcn add` die neuen Dateien auf fremde Imports durchsehen und `package.json` gegenprüfen. Hier: `useTheme` entfernt, die Toast-Farben laufen ohnehin über `--normal-bg: var(--popover)` und die restlichen Tokens.

## 2026-08-14 — AP 04: Dashboard-Shell
- Was passierte: Die automatisierte Prüfung meldete den Vorschau-Umschalter und das geöffnete Sheet als „nicht sichtbar", obwohl die Screenshots aus demselben Lauf beide zeigten. Ich hätte um ein Haar funktionierenden Code „repariert".
- Ursache: Die Prüfung nutzte `el.offsetParent !== null`. Bei `position: fixed` ist `offsetParent` immer `null` — genau die Elemente, die im Layout schweben, meldet dieser Test zuverlässig falsch.
- Konsequenz: Sichtbarkeit ausschließlich über `getBoundingClientRect()` (Breite und Höhe > 0) plus `visibility`/`display` prüfen, nie über `offsetParent`. Und: Screenshot schlägt Messwert. Wenn beide sich widersprechen, ist zuerst die Messung verdächtig.

- Was passierte: Derselbe Lauf meldete `outline-style: none` auf allen Bedienelementen — also scheinbar kein Fokusring, ein hartes Akzeptanzkriterium. Marek hat im echten Browser nachgesehen: der Ring ist da.
- Ursache: Tailwinds `ring-*` erzeugt keinen `outline`, sondern eine `box-shadow`-Ebene. Wer nur `outlineStyle` liest, misst am Ring vorbei. Die `boxShadow`-Kette war im Log zusätzlich abgeschnitten, sodass die ersten transparenten Ebenen wie „kein Ring" aussahen.
- Konsequenz: Fokus-Zustände nicht über eine einzelne CSS-Eigenschaft prüfen. Entweder `el.matches(':focus-visible')` plus **vollständige** `boxShadow`-Ausgabe, oder — verlässlicher — eine Nahaufnahme des fokussierten Elements und ein menschlicher Blick darauf. Für Barrierefreiheitskriterien ist der Screenshot der Beweis, nicht der Messwert.

- Was passierte: Nach den Design-Korrekturen lief das Verifikationsskript in einen kaputten Dev-Server und meldete nur „Element nie erschienen". Der echte Fehler stand ausschließlich im Dev-Log.
- Ursache: Ein JSX-Kommentar direkt nach `return (` ist syntaktisch ungültig — er wird zum zweiten Ausdruck neben dem Root-Element. Ich hatte nach der Korrektur nicht neu getypecheckt, sondern direkt den Browser-Lauf gestartet.
- Konsequenz: Nach **jeder** Code-Änderung erst `npm run typecheck`, dann der Browser-Lauf. Ein Browser-Test gegen kaputten Code kostet einen vollen Durchgang und zeigt ein Symptom, das nichts mit der Ursache zu tun hat. Erklärender Text gehört über das `return` als `//`-Kommentar, nicht als `{/* */}` davor.

- Was passierte: Der erste Entwurf sah im Light Mode flach aus — die Empty-State-Karte war vom Seitenhintergrund kaum zu unterscheiden.
- Ursache: Gradients, die auf `card/30` auslaufen, lösen die Fläche im Light-Theme auf, weil `--background` und `--card` dort ohnehin nur ~4 % Helligkeit trennen. Im Dark Mode fällt derselbe Aufbau nicht auf, weil der Kontrast zwischen den Tokens dort größer ist.
- Konsequenz: Flächen, die sich abheben sollen, bekommen die volle Token-Farbe plus Border plus Schatten. Transparenz-Gradients sind Dekoration obendrauf, nie die Trägerfläche. Und: Ein dark-first gebautes Layout muss trotzdem im Light Mode gegengeprüft werden — dort bricht es zuerst.

## 2026-08-14 — AP 03: Onboarding — Username wählen
- Was passierte: Der naheliegende Debounce-Aufbau (State für „ist gültig", „wird geprüft", „Ergebnis", alles im `useEffect` gesetzt) wurde von ESLint mit `react-hooks/set-state-in-effect` abgelehnt — synchrones `setState` im Effect-Body ist verboten.
- Ursache: Ein Effect soll React mit externen Systemen synchronisieren, nicht Zustand ableiten, den man beim Rendern berechnen kann. Nur der Server-Call ist hier wirklich extern.
- Konsequenz: Muster für alle folgenden Formulare mit Live-Prüfung — lokale Validierung beim Rendern ableiten, im State nur die Server-Antwort halten, und zwar zusammen mit der Eingabe, zu der sie gehört (`{ value, result }`). Verspätete Antworten laufen dadurch ins Leere, ohne zusätzliches Aufräumen.

- Was passierte: Der Absende-Button war zunächst bei „schon vergeben" deaktiviert. Damit wäre der in der Spec ausdrücklich geforderte Kollisionstest über die UI gar nicht auslösbar gewesen — der `23505`-Pfad im Server war unerreichbar.
- Ursache: Die Verfügbarkeitsanzeige wurde wie eine Entscheidung behandelt, obwohl sie laut eigener Begründung nur Komfort ist. Verbindlich ist allein die Unique-Constraint beim Absenden.
- Konsequenz: Eine Komfortprüfung darf den Server-Pfad nie unerreichbar machen. Gesperrt wird nur, was lokal eindeutig falsch ist; alles, was erst der Server entscheiden kann, bleibt absendbar. Sonst existiert Fehlerbehandlung, die nie läuft — und die man deshalb auch nicht testen kann.

- Was passierte: Das CDP-Klickskript aus AP 02 lässt sich für dieses Formular nicht wiederverwenden.
- Ursache: `element.value = …` funktioniert nur bei uncontrolled Inputs. Das Username-Feld ist controlled (`value` + `onChange` für die Auto-Kleinschreibung), React überschreibt den direkt gesetzten Wert beim nächsten Render.
- Konsequenz: Für controlled Inputs echte Tastatureingaben senden (`Input.insertText`/`Input.dispatchKeyEvent`) statt den Wert zu setzen. Bei Debounce-Feldern zusätzlich mindestens die Debounce-Dauer plus Server-Roundtrip warten, bevor man das Ergebnis ausliest.
- Was passierte: Der Sign-up scheiterte zweimal, und das Formular zeigte beide Male dieselbe nichtssagende Meldung „Die Registrierung hat nicht geklappt".
- Ursache: Generische Fehlermeldungen sind gegenüber dem Nutzer richtig (keine User-Enumeration), machen die Fehlersuche aber blind. Die echten Codes waren `over_email_send_rate_limit` und `email_not_confirmed` — sichtbar erst, nachdem ein `console.error` in der Server Action stand.
- Konsequenz: Jede generische Fehlermeldung im UI braucht von Anfang an ein `console.error` mit `error.code` und `error.message` in der Action. Gilt für alle folgenden Specs, nicht nur für Auth.

- Was passierte: Zwei Testläufe gingen für Konfigurationsprobleme drauf, die nichts mit dem Code zu tun hatten — „Confirm email" war entgegen der Angabe noch aktiv, und die zwei fehlgeschlagenen Versuche sprengten bereits das Free-Tier-Mailkontingent (`over_email_send_rate_limit`).
- Ursache: Dashboard-Einstellungen wurden abgefragt statt geprüft. Ein Häkchen ohne geklicktes „Save changes" sieht auf dem Screenshot aus wie eine gesetzte Einstellung.
- Konsequenz: Vor jedem Auth-Testlauf die Wirkung prüfen, nicht den Zustand abfragen — ein einzelner Sign-up gegen die API zeigt in Sekunden, ob die Einstellung wirklich greift. Und: Supabase lehnt E-Mail-Adressen auf `.test` grundsätzlich ab, Testadressen brauchen eine reguläre Domain wie `example.com`.

- Was passierte: Der geforderte Header-Test schlug teilweise fehl — `Cache-Control` kam als `no-cache, must-revalidate` an statt als `private, no-cache, no-store, must-revalidate, max-age=0`.
- Ursache: Der Proxy setzt die Header aus `@supabase/ssr` korrekt (`Expires: 0` und `Pragma: no-cache` kommen unverändert durch), aber Next.js normalisiert `Cache-Control` für dynamische Routen anschließend selbst.
- Konsequenz: Nicht dagegen ankämpfen — die Response trägt `Set-Cookie` und wird deshalb von Vercel und gängigen CDNs nicht im Shared Cache abgelegt. In Spec 10 auf der echten Vercel-Preview gegenprüfen, bevor die Sache als erledigt gilt.

- Was passierte: Positive Überraschung — der komplette Klickpfad ließ sich ohne LLM-Agenten automatisiert fahren.
- Ursache: `browser_use.Browser` gibt über `get_or_create_cdp_session()` direkten CDP-Zugriff. Weil die Formularfelder uncontrolled sind (kein `value`-Prop), reicht `element.value = …` plus `form.requestSubmit()` — React braucht dafür keinen State.
- Konsequenz: Das Skript im Scratchpad (`auth_flow.py`) ist die Vorlage für die Klickpfade in Spec 03–09. Wichtig: nach dem Absenden großzügig warten — bei 3 Sekunden lief die Action noch, und der Test meldete fälschlich „keine Fehlermeldung".

## 2026-08-14 — AP 01: Datenmodell-Ergänzungen
- Was passierte: Zwei der Spec-Tasks waren bereits erledigt — `on delete cascade` und der Index auf `(user_id, sort_order)` existierten seit dem Setup. Die Spec hatte das als „prüfen, falls nicht, nachziehen" formuliert, was sich als richtig erwies.
- Ursache: Die Spec wurde aus der Discovery geschrieben, nicht aus einem frischen Live-Abzug des Schemas. `list_tables` zeigt Foreign Keys, aber **nicht** deren Delete-Rule — dafür braucht es eine Abfrage auf `pg_constraint`.
- Konsequenz: Vor jeder Migration den Ist-Zustand live abfragen statt der Spec zu glauben. Für FK-Regeln und Indizes reichen `list_tables`/Doku nicht — `pg_constraint` und `pg_indexes` direkt abfragen.

- Was passierte: Der RLS-relevante Sicherheitstest von `reorder_links` ließ sich ohne echten Login durchführen.
- Ursache: In `execute_sql` funktioniert `begin; set local role authenticated; set local request.jwt.claims = '{"sub":"<uuid>"}'; ...; commit;` — damit liefert `auth.uid()` den gewünschten User, ohne dass ein Session-Token nötig ist.
- Konsequenz: Dieses Muster ist der Standardweg für alle künftigen RLS- und Policy-Tests in diesem Projekt (Specs 05–08). `set local` statt `set` verwenden, sonst bleibt die Rolle im Connection-Pool hängen.

- Was passierte: Übergibt man `reorder_links` eine fremde Link-ID, bleibt die fremde Zeile korrekt unberührt — aber die eigene Nummerierung bekommt dadurch eine Lücke bzw. ein Duplikat (im Test landeten zwei eigene Links auf `sort_order = 1`).
- Ursache: Die Ordinalität zählt über das gesamte Array, auch über Zeilen, die der Filter verwirft.
- Konsequenz: Kein Sicherheitsproblem, aber der Client darf in Spec 06 nur die vollständige eigene Liste übergeben. Sollte je eine lückenlose Nummerierung garantiert sein müssen, muss die Ordinalität erst nach dem Ownership-Filter vergeben werden.
