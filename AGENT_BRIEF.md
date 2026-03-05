# DAV Companion Site – Agent Brief

## Project Goal
Build a complete companion website + Docker learning environment for the university course
"Datenaufbereitung und -verarbeitung (DAV)" at THWS BBA (Prof. Dr. Robert Butscher).

## Reference
BigData companion site (same author, same design pattern):
- Local HTML files: /Users/robert/Library/CloudStorage/OneDrive-Persönlich/Vorlesungen/Sommersemester/Sommersemester_2026/BBA/SP_BigData/bigdata-lab/
- Live: https://swrobuts.github.io/bigdata/
READ those HTML files carefully before building – they are your primary design reference!

## Existing Assets (DAV course materials)
DAV_ASSETS_DIR=/Users/robert/Library/CloudStorage/OneDrive-Persönlich/Vorlesungen/Sommersemester/Sommersemester_2026/BBA/DAV/
- Musterdateien/: MOCK_DATA.csv, MOCK_DATA.json, muster_csv.csv, muster_json.json, 
  muster_xlsx.xlsx, dataset.xml, complex_muster_json.json, verkaufsdaten_mit_problemen.xlsx
- flights.csv, produkte.csv, kunden_musterdaten.json, cars.xlsx, mac_computer.db
- QuestionsDAV.txt: 32 quiz questions with answers [X] marked → use ALL of them!
- Existing notebooks (reference only): DataCleaning.ipynb, EDA_Python.ipynb, DatenSammeln.ipynb

COPY relevant data files into docker/data/ directory!

## Design Spec
- PRIMARY COLOR: #0389CF (blue – use as hero background, accents, cards)
- SECONDARY: #E8792F (orange – CTAs, highlights, badges) [same as BigData]
- STYLE: Bauhaus-inspired. Clean. Geometric. No decorative excess.
- Typography: System sans-serif stack (same as BigData)
- LANGUAGE: DE + EN only (bilingual toggle, inline JS translations like BigData)
- React 18 + Tailwind CDN + Lucide icons (same stack as BigData)
- Animations: subtle fade-in, hover transforms (copy BigData patterns)

## Website Files to Create

### index.html
- Hero section: #0389CF background, animated geometric shapes
- Course title: "Datenaufbereitung und -verarbeitung"
- Subtitle: "DAV – THWS Business School | Prof. Dr. Robert Butscher"
- Stats bar: "6 Themenmodule | 12+ Notebooks | 3 Fallstudien | Python + SQL"
- 6 Lab Cards (each links to its lab page):
  1. 🧭 Grundlagen & CRISP-DM → lab-grundlagen.html
  2. 📥 Daten sammeln → lab-data-acquisition.html  
  3. 🔍 Daten inspizieren & EDA → lab-eda.html
  4. 🧹 Daten bereinigen → lab-cleansing.html
  5. 🔄 Daten transformieren → lab-transformation.html
  6. 🎯 Fallstudien & Use Cases → lab-usecases.html
- Docker CTA section: "Starte deine Lernumgebung in 3 Minuten" → docker-guide.html
- Footer: same style as BigData

### docker-guide.html
- CONTENT: 1:1 from BigData docker-guide.html (same Docker setup steps, same explanation depth)
- COLORS: Replace #1B3A5C → #0389CF throughout
- Title: "DAV Lernumgebung starten" instead of "Big Data Lab"
- Docker command: use the DAV-specific image/compose (see Docker section below)
- Keep all copy-buttons, code blocks, step structure identical

### lab-grundlagen.html
Title: "Grundlagen & CRISP-DM"
Content:
- Was ist Datenaufbereitung? (Gartner, ComputerWeekly, Butscher definitions)
- CRISP-DM Modell mit DAV-Einordnung
- "Garbage in, Garbage out" Prinzip
- Warum Python? (pandas, numpy ecosystem)
- Lernziele aus Kursskript
- Quick-Start: erste Notebook-Zelle ausführen
- 5 Quiz questions (from QuestionsDAV.txt, pick relevant ones)
- Link → JupyterLab 01_CRISP_DM.ipynb

### lab-data-acquisition.html  
Title: "Daten sammeln"
Content:
- Datenquellen: Dateiformate (CSV, JSON, XML, Excel, Parquet)
- REST-APIs abfragen (requests, JSON parsing)
- Web Scraping (requests + BeautifulSoup, robots.txt, ethics)
- Datenbankverbindungen (SQLite, PostgreSQL via SQLAlchemy)
- Code examples for EACH topic (real, runnable Python)
- 5 Quiz questions
- Link → Notebooks 02_Dateiformate, 03_APIs_WebScraping

### lab-eda.html
Title: "Daten inspizieren & EDA"
Content:
- df.info(), df.describe(), df.head()
- Fehlende Werte visualisieren (missingno-style)
- Verteilungsanalyse (Histogramme, Boxplots)
- Korrelationsanalyse (Heatmaps)
- Ausreißer-Erkennung (Z-Score, IQR)
- 5 Quiz questions
- Link → Notebooks 04_Daten_Inspizieren

### lab-cleansing.html
Title: "Daten bereinigen"
Content:
- Fehlerbilder: Missing Values, Duplikate, Inkonsistenzen, Tippfehler
- Imputation-Strategien (Mean, Median, Mode, KNN)
- Duplikate entfernen
- Datentypen korrigieren
- Konditionales Löschen
- Real dataset: verkaufsdaten_mit_problemen.xlsx examples
- 7 Quiz questions
- Link → Notebooks 05_Daten_Bereinigen

### lab-transformation.html
Title: "Daten transformieren & strukturieren"
Content:
- Reshape: melt(), pivot(), stack()/unstack()
- One-Hot-Encoding, Label-Encoding
- Feature Scaling: Normalisierung vs. Standardisierung
- Feature Engineering
- Merging/Joining: merge(), concat(), join() mit SQL-Analogien
- Data Type Conversion
- 5 Quiz questions
- Link → Notebooks 06_Transformieren, 07_Zusammenfuehren

### lab-usecases.html
Title: "Fallstudien & Use Cases"
Content:
- Fallstudie 1: Customer Churn (Telco-Daten)
- Fallstudie 2: Movies Dataset (Filmanalyse)
- Fallstudie 3: Used Cars (Gebrauchtwagen-Preise)
- "Putting it all together": CRISP-DM Workflow komplett
- 5 Quiz questions
- Link → Notebooks 09, 10, 11

## Docker Setup to Create

### docker/Dockerfile
```dockerfile
FROM python:3.11-slim

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    sqlite3 \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python packages
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# JupyterLab config
RUN jupyter lab --generate-config && \
    echo "c.ServerApp.token = ''" >> /root/.jupyter/jupyter_lab_config.py && \
    echo "c.ServerApp.password = ''" >> /root/.jupyter/jupyter_lab_config.py && \
    echo "c.ServerApp.open_browser = False" >> /root/.jupyter/jupyter_lab_config.py && \
    echo "c.ServerApp.ip = '0.0.0.0'" >> /root/.jupyter/jupyter_lab_config.py

WORKDIR /home/jovyan
COPY notebooks/ ./notebooks/
COPY data/ ./data/

EXPOSE 8888
CMD ["jupyter", "lab", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root", "--NotebookApp.token=''"]
```

### docker/requirements.txt
```
jupyterlab>=4.0
pandas>=2.0
numpy>=1.24
matplotlib>=3.7
seaborn>=0.12
plotly>=5.15
requests>=2.31
beautifulsoup4>=4.12
lxml>=4.9
scrapy>=2.11
openpyxl>=3.1
pyarrow>=12.0
fastparquet>=2023.7
sqlalchemy>=2.0
psycopg2-binary>=2.9
ipywidgets>=8.0
tabulate>=0.9
scikit-learn>=1.3
ydata-profiling>=4.5
missingno>=0.5
tqdm>=4.65
```

### docker/docker-compose.yml
```yaml
version: '3.8'
services:
  jupyter:
    build: .
    ports:
      - "8888:8888"
    volumes:
      - ./notebooks:/home/jovyan/notebooks
      - ./data:/home/jovyan/data
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_DB=davdb
      - POSTGRES_USER=dav
      - POSTGRES_PASSWORD=dav2026
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: davdb
      POSTGRES_USER: dav
      POSTGRES_PASSWORD: dav2026
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Jupyter Notebooks to Create

ALL notebooks: German content, clean Markdown cells explaining concepts, runnable code cells,
💡 Tip cells, ✅ Challenge cells, quiz cells at the end using ipywidgets.

### notebooks/00_Willkommen.ipynb
- Kurs-Übersicht mit CRISP-DM Bild (ASCII art)
- Wie navigiere ich die Notebooks?
- Was ist installiert? (Paket-Check-Zelle)
- Verbindungstest zu PostgreSQL und SQLite
- Roadmap der 12 Module

### notebooks/01_CRISP_DM.ipynb
- CRISP-DM Phasen visualisiert mit matplotlib
- Wo steht DAV im Modell?
- Business Understanding → Data Understanding → Data Preparation
- Interaktive Frage: Welche Phase fehlt am meisten? (ipywidgets)
- Mini-Challenge: Finde DAV-Aktivitäten in echtem Projekt

### notebooks/02_Dateiformate.ipynb
- Szenarien: "Du arbeitest als Data Analyst bei einem Handelsunternehmen..."
- CSV lesen/schreiben: pd.read_csv(), verschiedene Delimiters, Encodings
- JSON lesen: pd.read_json(), json.loads(), verschachtelte JSON
- XML parsen: lxml, ElementTree
- Excel: pd.read_excel(), mehrere Sheets
- Parquet: pd.read_parquet(), pyarrow
- Vergleich: Dateigröße, Geschwindigkeit, Anwendungsfall
- 3 Challenges mit echter Musterdatei

### notebooks/03_APIs_WebScraping.ipynb
- Szenarien: "Deine Aufgabe ist es, Produktdaten von einer Website zu scrapen..."
- REST-API: OpenWeather API, JSONPlaceholder (öffentlich, kein Key)
- requests.get(), JSON-Response parsen, in DataFrame laden
- HTTP Status Codes verstehen
- Web Scraping: BeautifulSoup, HTML-Struktur verstehen
- robots.txt lesen und respektieren
- Reales Beispiel: Wikipedia-Tabelle scrapen
- Ethik und Rechtsfragen beim Scraping
- 3 Challenges (eine davon: API-Response in SQLite speichern)

### notebooks/04_Daten_Inspizieren.ipynb  
- Szenarien: "Du hast einen neuen Datensatz erhalten – was machst du als erstes?"
- df.info(), df.describe(), df.dtypes
- Fehlende Werte: df.isnull().sum(), Heatmap mit missingno
- Verteilungen: Histogramm, Boxplot, Violinplot
- Kategoriale Daten: value_counts(), Balkendiagramme
- Numerische Ausreißer: Z-Score, IQR-Methode
- Datensatz: verwendet flights.csv (interessant, real)
- 3 Challenges

### notebooks/05_Daten_Bereinigen.ipynb
- Szenarien: "Der Datensatz hat Probleme – bereinige ihn systematisch"
- Datensatz: verkaufsdaten_mit_problemen.xlsx (vorhanden!)
- Fehlende Werte: dropna(), fillna(), Imputation (mean, median, ffill)
- Duplikate: duplicated(), drop_duplicates()
- Inkonsistente Strings: strip(), lower(), replace()
- Datentypen korrigieren: astype(), pd.to_datetime()
- Ausreißer behandeln: capping, removal
- Konditionales Löschen
- "Vorher/Nachher" Qualitäts-Score
- 4 Challenges (eine davon SQL-basiert in SQLite)

### notebooks/06_Daten_Transformieren.ipynb
- Szenarien: "Bereite den Datensatz für ein ML-Modell vor"
- Reshape: melt(), pivot(), pivot_table()
- Stack/Unstack
- One-Hot-Encoding: pd.get_dummies(), sklearn OneHotEncoder
- Label-Encoding: LabelEncoder
- Normalisierung: MinMaxScaler
- Standardisierung: StandardScaler
- Feature Engineering: Alter berechnen, Kategorien erstellen, Bins
- 4 Challenges

### notebooks/07_Daten_Zusammenfuehren.ipynb
- Szenarien: "Füge Kundendaten aus 3 verschiedenen Quellen zusammen"
- pd.merge(): inner, left, right, outer join
- SQL-Analogien: SELECT * FROM a JOIN b ON...
- pd.concat(): axis=0 (Zeilen), axis=1 (Spalten)
- df.join()
- Echtes Beispiel mit 3 Datensätzen (Kunden, Bestellungen, Produkte)
- Anschließend: In PostgreSQL laden + SQL Joins üben
- 3 Challenges

### notebooks/08_Visualisierung.ipynb
- Szenarien: "Erstelle einen Report für deinen Vorgesetzten"
- matplotlib: Figure, Axes, Subplots
- seaborn: Statistik-Plots (pairplot, heatmap, distplot)
- plotly: Interaktive Charts (scatter, bar, line)
- Gute vs. schlechte Visualisierungen (Beispiele!)
- Chart-Auswahl: Wann welchen Plot?
- Dashboard-ähnliches Multi-Chart-Layout
- 3 Challenges

### notebooks/09_Fallstudie_Customer_Churn.ipynb
- Szenarien: "Du bist Data Analyst bei einem Telekommunikationsunternehmen"
- Datensatz generieren: Customer Churn (1000 Zeilen, realistische Daten)
  Spalten: customer_id, age, contract_type, monthly_charge, total_charges,
           tenure_months, internet_service, tech_support, churn (0/1)
- Vollständiger DAV-Workflow: Einlesen → Inspizieren → Bereinigen → Transformieren → EDA
- Erkenntnisse: Welche Faktoren beeinflussen Churn?
- Visualisierungen mit plotly
- In PostgreSQL laden + SQL-Abfragen

### notebooks/10_Fallstudie_Movies.ipynb
- Szenarien: "Analysiere Filmdaten für eine Streaming-Plattform"
- Datensatz generieren: 500 Filme mit: title, year, genre, rating, votes,
                        budget_mio, revenue_mio, director, runtime_min
- Vollständiger DAV-Workflow
- Interessante Fragen: Welches Genre ist profitabelst? Korrelation Budget↔Revenue?
- Feature Engineering: Decade, profit_ratio, rating_category
- JSON-Spalte (Tags) parsen und explodieren

### notebooks/11_Fallstudie_Used_Cars.ipynb
- Szenarien: "Du arbeitest für einen Gebrauchtwagenhändler"
- Nutze cars.xlsx aus dem Kurs (vorhanden!) und erweitere es mit generierten Daten
- Vollständiger Workflow
- Gehaltsmodell-Vorbereitung: Features für ML-Modell bereitstellen
- Encoding aller kategorischen Variablen
- Skalierung

### notebooks/12_Wissenstests.ipynb
- Alle 32 Fragen aus QuestionsDAV.txt (ALLE einbauen!)
- Implementierung mit ipywidgets (RadioButtons, Button für "Prüfen", Feedback)
- Aufgeteilt in Abschnitte:
  - Teil 1: Grundlagen (8 Fragen)
  - Teil 2: Methoden (12 Fragen)
  - Teil 3: Python & Tools (7 Fragen)
  - Teil 4: Fortgeschritten (5 Fragen)
- Score-Counter am Ende

## Data Files to Generate
Create these in docker/data/:
- customer_churn.csv (1000 rows, see notebook 09 spec)
- movies.csv (500 rows, see notebook 10 spec)
- used_cars_extended.csv (augmented version from cars.xlsx concept)
- orders.csv (Bestelldaten for merging exercise)
- customers.csv (Kundendaten for merging exercise)
- products.csv (Produktdaten for merging exercise)
- dav_sample.db (SQLite DB with all above tables pre-loaded)

Generate these with Python scripts, DO NOT hardcode hundreds of rows.

## GitHub Pages Config
Create .nojekyll file and make sure index.html is the root file.

## Completion Signal
When EVERYTHING is done (all HTML files, all notebooks, Dockerfile, docker-compose, data files),
run this exact command:
OPENCLAW_CONFIG_PATH=/Users/robert/clawd/.openclaw-macbot/openclaw.json \
OPENCLAW_STATE_DIR=/Users/robert/clawd/.openclaw-macbot \
openclaw system event --text "DAV Companion Site fertig! Alle HTML-Seiten, 12 Notebooks, Docker-Setup. Bitte prüfen!" --mode now
