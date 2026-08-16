# Design-Analyse — Phase 3

Erhoben am 14.08.2026 live im Browser (browser-use, CDP-Steuerung von Chrome, Viewport 1920×855).
Alle Zahlen sind **gemessene** `getComputedStyle`-Werte, keine Schätzungen. Screenshots liegen in `references/inspiration/`.

## Was tatsächlich untersucht wurde

| Ziel | Status | Datei |
|---|---|---|
| `linktr.ee/linktree` | ✅ Profil mit 1 Link (Layout-Referenz) | `linktree-profile.png` |
| `linktr.ee/spotify` | ✅ Profil mit 23 Links (Haupt-Referenz) | `linktree.png` |
| `beacons.ai/beacons` | ✅ Profil mit Cover, Bio, Sektionen | `beacons.png` |
| `bio.link` (Startseite) | ⚠️ nur Startseite auswertbar | – |
| `bio.link/<profil>` | ❌ **nicht erhoben** | – |

**Ehrliche Einschränkung:** Für bio.link konnte kein reales Profil geöffnet werden. Die geprüften Namen (`bio`, `biolink`, `hello`) liefern ungestylte Fehlerseiten — erkennbar an `font-family: "Times New Roman"` und transparentem Body, also HTML ohne geladenes CSS. Die Aussagen unten stützen sich daher auf **Linktree und Beacons**. Bento.me fällt weg, da am 13.02.2026 abgeschaltet (siehe `discovery.md`).

Zusätzlich geprüft wurden `linktr.ee/netflix` (gesperrter Account), `gymshark` (17 Links), `redbull` (32), `nike` (20), `shopify` (21) — die Struktur ist bei allen identisch, ausgewertet wurde Spotify.

---

## 1. Das dominante Layout-Muster: die zentrierte Karte

**Der wichtigste Befund der Exploration.** Beide Anbieter rendern die öffentliche Seite auf dem Desktop **nicht** vollflächig, sondern als schmalen, zentrierten Container auf einem kontrastierenden Grund:

- **Linktree**: weiße Fläche, ca. 420 px breit, auf mittelgrauem Hintergrund. Der Container läuft oben und unten randlos durch.
- **Beacons**: weiße Karte, ca. 525 px breit, mit großzügigem Eck-Radius, auf **schwarzem** Grund.

Die mobile Ansicht wird auf dem Desktop also bewusst beibehalten, statt in ein Desktop-Layout umgebaut zu werden. Das ist keine Bequemlichkeit, sondern konsequent: Der Traffic kommt aus Instagram- und TikTok-Bios, also von Mobilgeräten. Die Desktop-Ansicht ist der Sonderfall.

**Konsequenz für uns:** Die Seite `/u/<username>` bekommt einen zentrierten Container mit `max-width` um 480 px. Wir müssen für Desktop **kein eigenes Layout** bauen — das spart ein komplettes Arbeitspaket. Der Hintergrund dahinter ist die Fläche, auf der unser Design-System sich von den Vorbildern absetzen kann (siehe Abschnitt 5).

---

## 2. Gemessene Werte der Link-Karten

| Merkmal | Linktree (spotify) | Beacons |
|---|---|---|
| Breite × Höhe | **524 × 64 px** | **560 × 65 px** |
| Border-Radius | **8 px** | **16 px** |
| Box-Shadow | **`none`** | **`none`** |
| Hintergrund | `rgb(67, 230, 96)` — flache Accent-Farbe | `rgb(40, 72, 240)` — flache Accent-Farbe |
| Textfarbe | `rgb(30, 35, 48)` (dunkel auf hellem Grün) | `rgb(223, 222, 222)` (hell auf sattem Blau) |
| Rahmen | `0px` | `2px` |
| Schriftgröße / -gewicht | 16 px / 400 | 15 px / 500 |
| Transition | **0.075 s `ease`** | **0.25 s `cubic-bezier(0.4, 0, 0.2, 1)`** |
| Abstand zwischen Karten | **14 px** | ~16 px |
| Avatar | 96 px, `border-radius: 9999px` | rund, mit weißem Ring, überlappt das Cover |

**Interpretation der Kartenhöhe:** 64–65 px ist deutlich über dem WCAG-Minimum von 44 px und über der Material-Empfehlung von 48 px. Es ist die Höhe, bei der ein Daumen im Scrollen sicher trifft. Unsere geplanten 56 px liegen dazwischen — vertretbar, aber 60–64 px wäre näher am erprobten Standard.

**Interpretation der Textfarben:** Beide Anbieter wählen die Textfarbe passend zur Helligkeit ihrer Markenfarbe — Linktree dunkel auf hellem Grün, Beacons hell auf sattem Blau. Was bei ihnen eine *Design-Entscheidung für eine feste Farbe* ist, muss bei uns automatisch für **jede** Nutzerfarbe funktionieren. Genau das leistet die Luminanz-Umschaltung aus `guidelines.md` 004. Die Exploration bestätigt: Es gibt keinen Anbieter, von dem wir das abschauen könnten — die Vorbilder umgehen das Problem, statt es zu lösen.

---

## 3. Motion

| | Dauer | Easing | Bewertung gegen `rules/design-system.md` |
|---|---|---|---|
| Linktree | 75 ms | `ease` | **Unter unserem Minimum von 150 ms.** Wirkt hart, fast sprunghaft |
| Beacons | 250 ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Über unserem Minimum, sehr weich |
| bio.link (Startseite) | 200 ms | – | Im Zielkorridor |

`cubic-bezier(0.4, 0, 0.2, 1)` ist Materials Standard-Easing — schneller Start, sanftes Ausklingen.

**Empfehlung:** 180–200 ms mit `ease-out` als Projekt-Default. Das erfüllt unsere 150-ms-Untergrenze, liegt zwischen den beiden Referenzen und ist bei Hover-Zuständen auf Buttons noch als reaktionsschnell empfunden. Linktrees 75 ms ist explizit **kein** Vorbild.

---

## 4. Struktur der Public-Page (Reihenfolge von oben)

Beide Anbieter, in dieser Reihenfolge:

1. **Kopfbereich** — Beacons mit Cover-Bild und darüber ragendem Avatar (weißer Ring als Trennung); Linktree schlicht mit zentriertem Avatar
2. **Avatar**, rund, 96 px, zentriert
3. **Anzeigename** — bei Linktree `@username` in großer, fetter Schrift; bei Beacons der Markenname mit Verifikations-Badge
4. **Bio**, ein Satz, zentriert, kleiner und in gedämpfter Farbe
5. **Social-Icon-Reihe** (nur Beacons) — kleine Icons nebeneinander, deutlich abgesetzt von den Link-Karten
6. **Link-Karten**, einspaltig, volle Containerbreite
7. **Footer** mit Anbieter-Branding

**Ein Muster, das wir nicht übernehmen:** Beacons setzt **Überschriften zwischen Link-Gruppen** („Get started on Beacons today!", „Creator Resources"). Das ist eine Gruppierungsfunktion — nicht in unserem Scope, gehört in den Backlog.

**Detail bei Linktree:** Rechts in jeder Karte sitzt ein Drei-Punkte-Menü (Teilen/Melden). Für uns nicht nötig, aber es erklärt, warum der Kartentext **zentriert** ist und trotzdem nicht verrutscht: Das Icon liegt absolut positioniert, außerhalb des Textflusses.

---

## 5. Die zentrale Erkenntnis: unsere Vorbilder sind visuell flach

Der auffälligste gemessene Wert ist ein Negativ-Befund:

> **Weder Linktree noch Beacons verwenden auch nur einen einzigen Box-Shadow auf ihren Link-Karten. Beide nutzen flache, einfarbige Flächen ohne jeden Verlauf.**

Das steht in direktem Widerspruch zu `rules/design-system.md`, das weiche mehrschichtige Schatten, Gradients und Layering fordert und als Zielniveau Linear, Vercel, Raycast und Arc nennt.

Das ist kein Widerspruch, den wir auflösen müssen — es ist eine bewusste Arbeitsteilung:

- **Von Linktree/Beacons übernehmen wir die Struktur:** zentrierter Container, Reihenfolge der Elemente, Kartenhöhe um 60 px, einspaltige Liste, runder Avatar, zentrierter Text.
- **Die Oberflächenqualität holen wir uns nicht von ihnen.** Ihre Flächen sind flach, weil ihr Editor jede beliebige Nutzerfarbe zulassen muss und ein Verlauf auf einer unbekannten Farbe schnell schmutzig wirkt.

Und genau hier liegt unser Hebel: Weil wir die Akzentfarbe über `color-mix(in oklab, …)` in abgeleitete Töne zerlegen (`--brand-hover`, `--brand-subtle`, `--brand-ring`, siehe `guidelines.md` 004), können wir Layering und weiche Schatten anbieten, **ohne** das Risiko einzugehen, das die Vorbilder scheuen. Die Ableitungen sind perzeptuell kontrolliert, nicht geraten.

---

## 6. Konkrete Vorgaben für den Bau

Diese Werte gehen in die Feature-Specs:

| Element | Vorgabe | Herkunft |
|---|---|---|
| Container `/u/<username>` | `max-width: 480px`, zentriert, kein eigenes Desktop-Layout | gemessen bei beiden |
| Link-Karte Höhe | **60 px** (`min-height`) | zwischen 64 px gemessen und 56 px geplant |
| Link-Karte Radius | `rounded-2xl` (16 px) | Beacons; Linktrees 8 px ist zu kantig für unser Design-System |
| Abstand zwischen Karten | **12–14 px** | 14 px bei Linktree gemessen |
| Avatar | 96 px, voll rund | bei beiden identisch |
| Kartentext | zentriert, 15–16 px, `font-weight: 500` | Beacons |
| Transition | **180 ms `ease-out`** | Korridor zwischen beiden Referenzen |
| Karten-Hintergrund | `--brand` mit Layering statt flacher Fläche | **bewusste Abweichung** |
| Kartentextfarbe | automatisch über Luminanz-Schwellwert | löst ein Problem, das beide Vorbilder offen lassen |
| Schatten | weich, mehrschichtig | **bewusste Abweichung** |
| Tap-Target | alle Bedienelemente ≥ 44 px | WCAG, siehe `discovery.md` |

---

## 7. Offene Punkte

- **bio.link-Profil nicht analysiert.** Sollte eine echte Profil-URL bekannt werden, ließe sich die Analyse nachziehen. Der Erkenntnisgewinn wäre nach zwei übereinstimmenden Referenzen aber gering.
- **Editor-Ansichten nicht erhoben.** Die Editoren von Linktree und Beacons liegen hinter einem Login. Das Split-View-Layout aus `guidelines.md` 002 stützt sich daher auf die Dokumentations-Recherche aus Phase 1, nicht auf eigene Messung.
- **Hover-Zustände nicht gemessen.** `getComputedStyle` liefert nur den Ruhezustand; die `:hover`-Regeln stehen in externen Stylesheets. Die Transition-Dauern oben sind erhoben, die Ziel-Zustände nicht.
