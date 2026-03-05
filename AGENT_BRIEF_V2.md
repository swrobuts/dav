# DAV Lab – Fix Agent Brief V2

## Mission
Überarbeite alle 6 Lab-Seiten + docker-guide.html nach denselben Qualitätsstandards
wie die bereits fertige index.html. KEIN neuer Inhalt – nur Design/Optik/Qualität verbessern.

## Design-Referenz (PFLICHT zuerst lesen!)
- `index.html` – bereits fertig, ist dein Stil-Vorbild (Farben, Icons, Typografie, Whitespace)
- BigData Docker-Guide: /Users/robert/Library/CloudStorage/OneDrive-Persönlich/Vorlesungen/Sommersemester/Sommersemester_2026/BBA/SP_BigData/bigdata-lab/docker-guide.html
- Primärfarbe: #0389CF (Blau), Akzent: #E8792F (Orange)
- Keine Emoji-Icons! Nur Lucide SVG Line-Icons (stroke="currentColor")

## Zu bearbeitende Dateien
1. docker-guide.html
2. lab-grundlagen.html
3. lab-data-acquisition.html
4. lab-eda.html
5. lab-cleansing.html
6. lab-transformation.html
7. lab-usecases.html

## Konkrete Fixes pro Datei

### Alle Lab-Seiten gemeinsam:
1. **Navbar**: Einheitlich mit index.html – weißer Hintergrund, "← DAV Lab" Back-Link links,
   Seitenname mittig/rechts, DE/EN Toggle. Gleiche CSS-Klassen wie index.html.
2. **Emojis ersetzen**: Alle 📌🎯🧹🔍📥🧭💡✅❓🏆 etc. durch saubere Lucide SVG Icons.
   Gleiche Icon-Helper-Funktion wie in index.html (Icon-Komponente mit paths-Array).
3. **Text-Overflow**: Überall wo Text aus Boxen läuft → padding erhöhen, min-width setzen,
   oder Text in eigene Zeile. Keine Überlappungen.
4. **Whitespace**: Sections mit py-16 bis py-20. Cards mit p-6 bis p-8. Mehr Luft.
5. **Boxen/Cards**: Einheitliches Border-System: border: 1.5px solid rgba(3,137,207,0.15),
   border-radius: 10px. Keine random farbigen Borders ohne System.
6. **Footer**: Einheitlich dunkel (#0f172a) wie index.html, mit Back-Link.
7. **Quiz-Fragen**: Gut lesbar, pro Frage genug Padding, Antworten klar abgesetzt.
8. **Notebook-Button**: Orangefarbener CTA-Button "→ Notebook in Docker öffnen" am Ende
   jeder Lab-Seite. Sauber gestylt, kein Emoji davor.
9. **Funktionalität prüfen**: Alle Links, DE/EN-Toggle, Quiz-Logik testen (mental walkthrough).
   Sicherstellen dass alle href-Attribute auf existierende Dateien zeigen.

### docker-guide.html speziell:
- Farbe: Alle #1B3A5C → #0389CF ersetzen (falls noch nicht passiert)
- Titel: "DAV Lernumgebung starten" (nicht "Big Data Lab")
- Docker-Befehle: git clone URL muss `swrobuts/dav` heißen (nicht bigdata)
- Copy-Buttons müssen funktionieren
- Gleicher Footer wie alle anderen Seiten

### Lab-Seiten: Sidebar-Nav
Die Sidebar-Navigation links ist OK zu behalten, aber:
- Gleiche Farbe (#0389CF für aktive Links)
- Kein AI-Slop-Styling (keine bunten Kreise vor jedem Item)
- Sauber und minimal: einfache Links, hover-Unterstrich, kein Overdesign

## Qualitätsprüfung (für jede Datei)
Nach jeder Datei mental prüfen:
- [ ] Kein Emoji mehr sichtbar
- [ ] Navbar funktioniert (Back-Link, DE/EN)
- [ ] Kein Text läuft aus Container
- [ ] Konsistente Farben (#0389CF / #E8792F)
- [ ] Footer vorhanden
- [ ] Notebook-CTA-Button vorhanden

## Abschluss
1. Alle Dateien git add + commit "fix: visual overhaul all lab pages"
2. git push
3. Completion signal:
OPENCLAW_CONFIG_PATH=/Users/robert/clawd/.openclaw-macbot/openclaw.json \
OPENCLAW_STATE_DIR=/Users/robert/clawd/.openclaw-macbot \
openclaw system event --text "DAV Lab-Seiten alle überarbeitet und gepusht!" --mode now
