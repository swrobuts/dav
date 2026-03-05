# DAV Lab – Umbau auf Colab-First (V3)

## Entscheidung
Docker wird komplett entfernt. Google Colab ist der einzige Lernweg.
Deutlich mehr Use Cases (Fallstudien) werden hinzugefügt.

## Neue Repo-Struktur (Ziel)
```
dav-lab/
├── index.html              ← anpassen (Docker weg, Colab hero)
├── colab-guide.html        ← NEU (ersetzt docker-guide.html)
├── lab-grundlagen.html     ← Update: Docker-Links → Colab-Links
├── lab-data-acquisition.html ← Update
├── lab-eda.html            ← Update
├── lab-cleansing.html      ← Update
├── lab-transformation.html ← Update
├── lab-usecases.html       ← Update (mehr Use Cases!)
├── notebooks/              ← NEU: verschoben aus docker/notebooks/
│   ├── 00_Willkommen.ipynb
│   ├── 01_CRISP_DM.ipynb
│   ├── 02_Dateiformate.ipynb
│   ├── 03_APIs_WebScraping.ipynb
│   ├── 04_Daten_Inspizieren.ipynb
│   ├── 05_Daten_Bereinigen.ipynb
│   ├── 06_Daten_Transformieren.ipynb
│   ├── 07_Daten_Zusammenfuehren.ipynb
│   ├── 08_Visualisierung.ipynb
│   ├── 09_Fallstudie_Customer_Churn.ipynb
│   ├── 10_Fallstudie_Movies.ipynb
│   ├── 11_Fallstudie_Used_Cars.ipynb
│   ├── 12_Fallstudie_Supermarkt.ipynb    ← NEU
│   ├── 13_Fallstudie_HR_Analytics.ipynb  ← NEU
│   ├── 14_Fallstudie_Energie.ipynb       ← NEU
│   ├── 15_Fallstudie_Ecommerce.ipynb     ← NEU
│   └── 16_Wissenstests.ipynb
├── data/                   ← NEU: verschoben aus docker/data/
│   ├── customer_churn.csv
│   ├── movies.csv
│   ├── used_cars_extended.csv
│   └── ... (alle bestehenden CSVs)
├── docker/                 ← BEHALTEN aber nicht mehr verlinkt (für Archiv)
└── .nojekyll
```

## Schritt 1: Dateien verschieben
```bash
cp -r docker/notebooks/ notebooks/
cp -r docker/data/ data/
```
(docker/ Ordner NICHT löschen, nur nicht mehr verlinken)

## Schritt 2: index.html anpassen

### Was ändern:
- Hero-Section: "Docker starten" Button → "In Colab öffnen" Button
  Neuer Link: https://colab.research.google.com/github/swrobuts/dav/blob/main/notebooks/00_Willkommen.ipynb
- Stats-Bar: "12+ Notebooks" → "16+ Notebooks"
- Docker CTA Section (blauer Bereich "Starte deine Lernumgebung in 3 Minuten") komplett ersetzen durch:
  Colab CTA Section mit denselben Farben (#0389CF bg) aber Colab-Schritten:
  1. "Notebook öffnen" → colab.research.google.com/github/swrobuts/dav
  2. "Laufzeitumgebung starten" → Runtime → Run all (oder einzelne Zellen)
  3. "Fertig!" → Alles läuft in der Cloud, kein Install nötig
- Docker Guide Link → colab-guide.html (umbenennen!)
- nav: "Docker" → "Colab"

### Neue Use Cases Sektion auf index.html:
Nach den 6 Lernmodul-Cards eine neue Sektion "Fallstudien & Datensätze":
16 Notebooks mit Colab-Badges, aufgeteilt in:
- Grundlagen-Notebooks (01-08)
- Fallstudien (09-16)

## Schritt 3: colab-guide.html ERSTELLEN

Inhalt (analog zu docker-guide.html, aber für Colab):
- Titel: "Mit Google Colab starten"
- Untertitel: "Kein Setup. Kein Download. Einfach öffnen und loslegen."
- 3 Schritte:
  1. Google-Account öffnen + colab.research.google.com
  2. Datei → Notebook von GitHub öffnen → swrobuts/dav → Notebook wählen
  3. Laufzeit → Alle ausführen (oder ▶ pro Zelle)
- Direktlinks zu allen 16 Notebooks (Colab-Badge-Links)
- Tipp-Sektion: "Daten werden automatisch geladen", "GPU nicht nötig für DAV", "Speichern in Google Drive"
- Gleicher Design-Stil wie bisherige Seiten

## Schritt 4: Alle 6 Lab-Seiten updaten

Für JEDE Lab-Seite:
- "Notebook in Docker öffnen" Button entfernen oder umschreiben zu "In Docker öffnen (optional)"
- localhost:8888 Links komplett entfernen
- Colab-Badge-Links aktualisieren auf neuen Pfad: /notebooks/ statt /docker/notebooks/
- docker-guide.html Links → colab-guide.html

## Schritt 5: Notebooks updaten (notebooks/ Ordner)

Für ALLE bestehenden Notebooks (01-11):
- Erste Zelle: "Setup" mit `!pip install` für alle nicht-Standard-Pakete (ydata-profiling, missingno, plotly etc.)
- Zweite Zelle: Daten laden via GitHub Raw URL:
  ```python
  BASE_URL = "https://raw.githubusercontent.com/swrobuts/dav/main/data/"
  ```
- Alle lokalen Pfade (/home/jovyan/data/) → BASE_URL + filename
- PostgreSQL-Verbindungen → SQLite (bereits in Python eingebaut, kein Server nötig)
- docker-compose Hinweise entfernen

## Schritt 6: Neue Fallstudien-Notebooks erstellen

### 12_Fallstudie_Supermarkt.ipynb
Szenario: "Du bist Data Analyst bei einer deutschen Supermarktkette"
- Dataset generieren: 2000 Zeilen Verkaufsdaten
  Spalten: datum, filiale, kategorie, produkt, menge, einzelpreis, gesamtpreis, zahlungsart, uhrzeit
- Vollständiger DAV-Workflow
- Interessante Fragen: Welche Kategorie umsatzstärkst? Kaufverhalten nach Tageszeit?
- Feature Engineering: Wochentag, Jahreszeit, Umsatz pro Filiale
- Visualisierungen mit plotly

### 13_Fallstudie_HR_Analytics.ipynb
Szenario: "Als HR-Analyst sollst du Mitarbeiterabgang vorhersagen"
- Dataset generieren: 1500 Mitarbeiter
  Spalten: mitarbeiter_id, abteilung, gehalt, überstunden_pro_woche, zufriedenheit (1-5),
           betriebszugehörigkeit_jahre, beförderungen_letzte_3j, abgang (0/1)
- Vollständiger DAV-Workflow inkl. Encoding aller kategorialen Spalten
- Korrelationsanalyse: Was beeinflusst Abgang am stärksten?
- Vorbereitung für ML: Feature Engineering, Skalierung

### 14_Fallstudie_Energie.ipynb
Szenario: "Analysiere den Stromverbrauch eines Unternehmens"
- Dataset generieren: Stündliche Messwerte über 1 Jahr
  Spalten: timestamp, verbrauch_kwh, temperatur, wochentag, ist_feiertag, schicht
- Zeitreihenanalyse: Rolling Mean, Saisonalität
- Fehlende Werte durch Sensorausfälle simulieren → bereinigen
- Visualisierung: Heatmap Stunde×Wochentag

### 15_Fallstudie_Ecommerce.ipynb
Szenario: "Du analysierst Bestelldaten eines Online-Shops"
- Dataset generieren: 3000 Bestellungen
  Spalten: bestellnummer, datum, kunden_id, produktkategorie, land, anzahl,
           preis_eur, versandkosten, retourniert (True/False), bewertung (1-5)
- Merging: Bestellungen + Kundentabelle + Produkttabelle (3-Tabellen-Join)
- Pivot: Umsatz pro Land und Kategorie
- RFM-Analyse vorbereiten (Recency, Frequency, Monetary)

## Schritt 7: data/ Ordner
Kopierte CSVs ergänzen um neue Datasets (für die 4 neuen Fallstudien).
Per Python-Script generieren mit festem `random_state=42` für Reproduzierbarkeit.

## Schritt 8: lab-usecases.html erweitern
Alle 7 Fallstudien auflisten (Churn, Movies, Used Cars, Supermarkt, HR, Energie, Ecommerce)
Pro Fallstudie: Kurzbeschreibung + Colab-Badge + Schwierigkeitsgrad

## Abschluss
1. git add -A
2. git commit -m "refactor: Colab-First, remove Docker, add 4 new case studies"
3. git push
4. Completion signal:
OPENCLAW_CONFIG_PATH=/Users/robert/clawd/.openclaw-macbot/openclaw.json \
OPENCLAW_STATE_DIR=/Users/robert/clawd/.openclaw-macbot \
openclaw system event --text "DAV Umbau auf Colab fertig! 4 neue Fallstudien, 16 Notebooks, Docker entfernt. Bitte prüfen!" --mode now
