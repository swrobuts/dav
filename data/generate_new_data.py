"""
Generate new CSV data files for DAV lab notebooks 12-15.
Run: python data/generate_new_data.py
"""

import numpy as np
import pandas as pd
from pathlib import Path
import random

rng = np.random.default_rng(42)
random.seed(42)
np.random.seed(42)

OUT = Path(__file__).parent

# ─────────────────────────────────────────────
# 1.  supermarkt_verkauf.csv  (2 000 rows)
# ─────────────────────────────────────────────
print("Generating supermarkt_verkauf.csv …")

n = 2000
filialen = ['Berlin-Mitte', 'München-Hauptbahnhof', 'Hamburg-Altona',
            'Frankfurt-Sachsenhausen', 'Köln-Ehrenfeld']
kategorien = ['Obst & Gemüse', 'Backwaren', 'Molkereiprodukte',
              'Fleisch & Wurst', 'Getränke', 'Tiefkühlkost', 'Süßwaren', 'Hygiene']

produkte_map = {
    'Obst & Gemüse':     ['Äpfel (1 kg)', 'Bananen (500 g)', 'Tomaten (500 g)',
                          'Karotten (1 kg)', 'Brokkoli', 'Salat (Kopf)', 'Orangen (1 kg)'],
    'Backwaren':         ['Roggenbrot', 'Baguette', 'Brötchen (6 Stk.)',
                          'Vollkornbrot', 'Croissant', 'Laugenbrezel'],
    'Molkereiprodukte':  ['Vollmilch (1 l)', 'Butter (250 g)', 'Gouda (400 g)',
                          'Joghurt (500 g)', 'Quark (500 g)', 'Sahne (200 ml)'],
    'Fleisch & Wurst':   ['Hähnchenbrust (500 g)', 'Rinderhackfleisch (500 g)',
                          'Salami (200 g)', 'Leberwurst (200 g)', 'Schweinekotelett (500 g)'],
    'Getränke':          ['Mineralwasser (1,5 l)', 'Orangensaft (1 l)', 'Cola (1,5 l)',
                          'Apfelsaft (1 l)', 'Bier (6er-Pack)', 'Eistee (500 ml)'],
    'Tiefkühlkost':      ['Pizza Margherita', 'Tiefkühlerbsen (750 g)',
                          'Fischstäbchen (400 g)', 'Pommes Frites (750 g)', 'Eis (500 ml)'],
    'Süßwaren':          ['Schokolade (100 g)', 'Gummibärchen (200 g)',
                          'Kekse (400 g)', 'Marzipan (200 g)', 'Chips (200 g)'],
    'Hygiene':           ['Shampoo (250 ml)', 'Duschgel (300 ml)', 'Zahnpasta (75 ml)',
                          'Waschmittel (1,5 kg)', 'Handseife (300 ml)', 'Rasierer'],
}

preise_map = {
    'Obst & Gemüse':    (0.79, 3.49),
    'Backwaren':        (0.49, 2.99),
    'Molkereiprodukte': (0.89, 4.99),
    'Fleisch & Wurst':  (2.49, 8.99),
    'Getränke':         (0.79, 6.99),
    'Tiefkühlkost':     (1.99, 7.99),
    'Süßwaren':         (0.59, 4.49),
    'Hygiene':          (1.49, 12.99),
}

dates = pd.to_datetime(
    rng.integers(0, 365, n), unit='D', origin='2024-01-01'
).normalize()

kat_arr = rng.choice(kategorien, n)
fil_arr = rng.choice(filialen, n)
produkt_arr = np.array([random.choice(produkte_map[k]) for k in kat_arr])
menge_arr = rng.integers(1, 11, n)

einzelpreis_arr = np.array([
    round(rng.uniform(*preise_map[k]), 2) for k in kat_arr
])
gesamtpreis_arr = (menge_arr * einzelpreis_arr).round(2)

zahlungsart_arr = rng.choice(
    ['Bargeld', 'EC-Karte', 'Kreditkarte', 'Apple Pay'],
    n, p=[0.25, 0.45, 0.20, 0.10]
)

stunden = rng.integers(7, 22, n)
minuten = rng.integers(0, 60, n)
uhrzeit_arr = [f"{h:02d}:{m:02d}" for h, m in zip(stunden, minuten)]

wochentage_de = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag']
wochentag_arr = [wochentage_de[d.weekday()] for d in dates]

df_sm = pd.DataFrame({
    'datum': dates.strftime('%Y-%m-%d'),
    'filiale': fil_arr,
    'kategorie': kat_arr,
    'produkt': produkt_arr,
    'menge': menge_arr,
    'einzelpreis': einzelpreis_arr,
    'gesamtpreis': gesamtpreis_arr,
    'zahlungsart': zahlungsart_arr,
    'uhrzeit': uhrzeit_arr,
    'wochentag': wochentag_arr,
})
df_sm.to_csv(OUT / 'supermarkt_verkauf.csv', index=False)
print(f"  -> {len(df_sm)} rows written.")

# ─────────────────────────────────────────────
# 2.  mitarbeiter_hr.csv  (1 500 rows)
# ─────────────────────────────────────────────
print("Generating mitarbeiter_hr.csv …")

n_hr = 1500
abteilungen = ['IT', 'Vertrieb', 'Marketing', 'HR', 'Finanzen', 'Produktion', 'Logistik']

# Base salaries per department
gehalt_params = {
    'IT':         (62000, 15000),
    'Finanzen':   (58000, 12000),
    'Marketing':  (48000, 10000),
    'Vertrieb':   (45000, 12000),
    'HR':         (42000, 8000),
    'Produktion': (36000, 7000),
    'Logistik':   (34000, 6000),
}
ueber_params = {
    'IT':         (3.0, 2.0),
    'Vertrieb':   (6.0, 3.0),
    'Produktion': (7.0, 3.5),
    'Logistik':   (6.5, 3.0),
    'Marketing':  (4.0, 2.5),
    'HR':         (2.5, 1.5),
    'Finanzen':   (3.5, 2.0),
}

abt_arr = rng.choice(abteilungen, n_hr)
gehalt_arr = np.array([
    int(np.clip(rng.normal(*gehalt_params[a]), 28000, 95000))
    for a in abt_arr
])
ueber_arr = np.array([
    round(float(np.clip(rng.normal(*ueber_params[a]), 0, 15)), 1)
    for a in abt_arr
])

# Zufriedenheit correlated with salary rank and overtime
gehalt_norm = (gehalt_arr - gehalt_arr.min()) / (gehalt_arr.max() - gehalt_arr.min())
ueber_norm  = (ueber_arr - ueber_arr.min()) / (ueber_arr.max() - ueber_arr.min())
zuf_raw = 2.5 + 1.5 * gehalt_norm - 1.0 * ueber_norm + rng.normal(0, 0.5, n_hr)
zuf_arr = np.clip(np.round(zuf_raw).astype(int), 1, 5)

betr_arr = rng.integers(0, 26, n_hr)
bef_arr  = rng.integers(0, 4, n_hr)

# Abgang: low satisfaction + high overtime => higher probability
abgang_prob = 0.05 + 0.12 * (5 - zuf_arr) / 4 + 0.08 * ueber_norm
abgang_prob = np.clip(abgang_prob, 0, 0.6)
abgang_arr  = (rng.random(n_hr) < abgang_prob).astype(int)

geschlecht_arr = rng.choice(['M', 'W', 'D'], n_hr, p=[0.50, 0.47, 0.03])
alter_arr = rng.integers(22, 63, n_hr)
ids = [f"M{i:04d}" for i in range(1, n_hr + 1)]

df_hr = pd.DataFrame({
    'mitarbeiter_id': ids,
    'abteilung': abt_arr,
    'gehalt': gehalt_arr,
    'ueberstunden_pro_woche': ueber_arr,
    'zufriedenheit': zuf_arr,
    'betriebszugehoerigkeit_jahre': betr_arr,
    'befoerderungen_letzte_3j': bef_arr,
    'abgang': abgang_arr,
    'geschlecht': geschlecht_arr,
    'alter': alter_arr,
})
df_hr.to_csv(OUT / 'mitarbeiter_hr.csv', index=False)
print(f"  -> {len(df_hr)} rows written. Abgang-Rate: {df_hr['abgang'].mean()*100:.1f}%")

# ─────────────────────────────────────────────
# 3.  energie_verbrauch.csv  (8 760 rows)
# ─────────────────────────────────────────────
print("Generating energie_verbrauch.csv …")

timestamps = pd.date_range('2024-01-01', periods=8760, freq='h')
hours   = timestamps.hour
months  = timestamps.month
weekday = timestamps.dayofweek   # 0=Mon

# Hour effect: business hours peak
hour_effect = np.where((hours >= 8) & (hours <= 17), 80, 0)
hour_effect += np.where((hours >= 6) & (hours < 8),  40, 0)
hour_effect += np.where((hours >= 18) & (hours <= 21), 30, 0)

# Weekday: less on weekends
weekday_effect = np.where(weekday < 5, 20, -20)

# Seasonal: winter heating load is higher
season_effect = 30 * np.cos((months - 1) * 2 * np.pi / 12) * -1  # peak in winter

verbrauch = (150 + hour_effect + weekday_effect + season_effect
             + rng.normal(0, 12, 8760))
verbrauch = np.clip(verbrauch, 30, None)

# ~5% NaN
nan_mask = rng.random(8760) < 0.05
verbrauch_nan = np.where(nan_mask, np.nan, verbrauch).astype(float)

# Temperature: seasonal German climate
temp = (12 + 10 * np.cos((months - 7) * 2 * np.pi / 12) * -1
        + rng.normal(0, 3, 8760))

# Holidays (German public holidays approx)
holiday_days = {'01-01', '04-01', '05-01', '10-03', '10-31', '12-25', '12-26'}
ist_feiertag = np.array([ts.strftime('%m-%d') in holiday_days for ts in timestamps])

schicht = np.where(hours < 6, 'Nacht',
          np.where(hours < 14, 'Früh', 'Spät'))

df_en = pd.DataFrame({
    'timestamp':    timestamps.strftime('%Y-%m-%d %H:%M:%S'),
    'verbrauch_kwh': np.round(verbrauch_nan, 2),
    'temperatur':   np.round(temp, 1),
    'wochentag':    timestamps.day_name(),
    'ist_feiertag': ist_feiertag,
    'schicht':      schicht,
    'stunde':       hours,
    'monat':        months,
})
df_en.to_csv(OUT / 'energie_verbrauch.csv', index=False)
print(f"  -> {len(df_en)} rows written. NaN verbrauch: {df_en['verbrauch_kwh'].isna().sum()}")

# ─────────────────────────────────────────────
# 4a.  ecommerce_produkte.csv  (50 rows)
# ─────────────────────────────────────────────
print("Generating ecommerce_produkte.csv …")

kategorien_ec = ['Elektronik', 'Mode', 'Bücher', 'Sport', 'Haushalt', 'Spielzeug']
produkte_ec = [
    # Elektronik (P001-P010)
    ('Bluetooth-Kopfhörer', 'Elektronik', 79.99, 145),
    ('USB-C Hub 7-Port', 'Elektronik', 34.99, 230),
    ('Smartwatch Fitness', 'Elektronik', 129.99, 88),
    ('Tischlampe LED', 'Elektronik', 24.99, 312),
    ('Powerbank 20000 mAh', 'Elektronik', 44.99, 175),
    ('Webcam Full HD', 'Elektronik', 59.99, 95),
    ('Maus kabellos', 'Elektronik', 19.99, 420),
    ('Tastatur mechanisch', 'Elektronik', 89.99, 67),
    ('Lautsprecher Bluetooth', 'Elektronik', 49.99, 143),
    ('E-Book-Reader', 'Elektronik', 109.99, 52),
    # Mode (P011-P020)
    ('Winterjacke (M)', 'Mode', 89.99, 78),
    ('Jeans Slim Fit (32/32)', 'Mode', 59.99, 134),
    ('Sneaker (Gr. 42)', 'Mode', 79.99, 99),
    ('T-Shirt Basic (L)', 'Mode', 14.99, 450),
    ('Pullover Strick (M)', 'Mode', 39.99, 112),
    ('Sommerschuhe (Gr. 38)', 'Mode', 49.99, 87),
    ('Ledergürtel (Gr. M)', 'Mode', 24.99, 201),
    ('Handschuhe Leder', 'Mode', 34.99, 65),
    ('Mütze Wolle', 'Mode', 19.99, 178),
    ('Rucksack 25 l', 'Mode', 54.99, 93),
    # Bücher (P021-P025)
    ('Python für Einsteiger', 'Bücher', 29.99, 340),
    ('Data Science Grundlagen', 'Bücher', 34.99, 156),
    ('Der Herr der Ringe', 'Bücher', 22.99, 289),
    ('Kochbuch vegetarisch', 'Bücher', 24.99, 203),
    ('Reiseführer Deutschland', 'Bücher', 19.99, 178),
    # Sport (P026-P033)
    ('Yogamatte (6 mm)', 'Sport', 29.99, 215),
    ('Hanteln Set (2x10 kg)', 'Sport', 49.99, 88),
    ('Laufschuhe (Gr. 42)', 'Sport', 89.99, 74),
    ('Fahrradhelm', 'Sport', 44.99, 112),
    ('Fitnessmatte', 'Sport', 24.99, 193),
    ('Springseil', 'Sport', 9.99, 310),
    ('Trinkflasche (750 ml)', 'Sport', 14.99, 425),
    ('Tennisschläger', 'Sport', 69.99, 56),
    # Haushalt (P034-P042)
    ('Kaffeemaschine', 'Haushalt', 79.99, 63),
    ('Wasserkocher', 'Haushalt', 29.99, 187),
    ('Toaster', 'Haushalt', 24.99, 210),
    ('Brettset Schneidebrett 3-tlg.', 'Haushalt', 19.99, 145),
    ('Pfanne Teflon 28 cm', 'Haushalt', 34.99, 162),
    ('Bettüberwurf (200x200)', 'Haushalt', 44.99, 89),
    ('Bettwäsche-Set', 'Haushalt', 39.99, 134),
    ('Handtuch-Set 4-tlg.', 'Haushalt', 29.99, 201),
    ('Regenschirm faltbar', 'Haushalt', 19.99, 267),
    # Spielzeug (P043-P050)
    ('LEGO City Set', 'Spielzeug', 49.99, 78),
    ('Puzzle 1000 Teile', 'Spielzeug', 14.99, 312),
    ('Plüschtier Bär', 'Spielzeug', 19.99, 234),
    ('Gesellschaftsspiel Familien', 'Spielzeug', 29.99, 187),
    ('Ferngesteuertes Auto', 'Spielzeug', 39.99, 91),
    ('Malset Kinder', 'Spielzeug', 12.99, 415),
    ('Puppenwagen', 'Spielzeug', 59.99, 43),
    ('Holzpuzzle 3D', 'Spielzeug', 24.99, 167),
]

df_prod = pd.DataFrame(produkte_ec, columns=['produktname', 'kategorie', 'preis_eur', 'lagermenge'])
df_prod.insert(0, 'produkt_id', [f"P{i:03d}" for i in range(1, 51)])
df_prod.to_csv(OUT / 'ecommerce_produkte.csv', index=False)
print(f"  -> {len(df_prod)} rows written.")

# ─────────────────────────────────────────────
# 4b.  ecommerce_kunden.csv  (800 rows)
# ─────────────────────────────────────────────
print("Generating ecommerce_kunden.csv …")

vornamen_m = ['Thomas', 'Michael', 'Andreas', 'Stefan', 'Christian', 'Klaus',
              'Peter', 'Frank', 'Hans', 'Jürgen', 'Markus', 'Daniel',
              'Martin', 'Sebastian', 'Alexander', 'Tobias', 'Florian', 'Tim',
              'Jan', 'Felix', 'Lukas', 'Leon', 'Jonas', 'Noah', 'Paul']
vornamen_w = ['Anna', 'Maria', 'Laura', 'Julia', 'Sandra', 'Sabine',
              'Petra', 'Christine', 'Monika', 'Lisa', 'Sarah', 'Nicole',
              'Katharina', 'Jessica', 'Hannah', 'Emma', 'Lea', 'Lena',
              'Sophie', 'Marie', 'Clara', 'Mia', 'Lara', 'Johanna', 'Amelie']
nachnamen = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer',
             'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch',
             'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann',
             'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann', 'Hartmann',
             'Lange', 'Schmitt', 'Werner', 'Krause', 'Lehmann', 'Köhler']

n_k = 800
geschlecht_k = rng.choice(['M', 'W'], n_k, p=[0.48, 0.52])
vornamen_k = np.array([
    random.choice(vornamen_m if g == 'M' else vornamen_w)
    for g in geschlecht_k
])
nachnamen_k = rng.choice(nachnamen, n_k)
emails_k = [
    f"{v.lower().replace('ü','ue').replace('ö','oe').replace('ä','ae')}."
    f"{n.lower().replace('ü','ue').replace('ö','oe').replace('ä','ae').replace('sch','sch')}@example.de"
    for v, n in zip(vornamen_k, nachnamen_k)
]

reg_dates = pd.to_datetime(
    rng.integers(0, 731, n_k), unit='D', origin='2023-01-01'
).normalize().strftime('%Y-%m-%d')

kundengruppen = rng.choice(['Bronze', 'Silber', 'Gold', 'Platin'],
                           n_k, p=[0.45, 0.30, 0.18, 0.07])

df_kunden = pd.DataFrame({
    'kunden_id':       [f"K{i:04d}" for i in range(1, n_k + 1)],
    'vorname':         vornamen_k,
    'nachname':        nachnamen_k,
    'email':           emails_k,
    'registriert_seit': reg_dates,
    'kundengruppe':    kundengruppen,
})
df_kunden.to_csv(OUT / 'ecommerce_kunden.csv', index=False)
print(f"  -> {len(df_kunden)} rows written.")

# ─────────────────────────────────────────────
# 4c.  ecommerce_bestellungen.csv  (3 000 rows)
# ─────────────────────────────────────────────
print("Generating ecommerce_bestellungen.csv …")

n_b = 3000
preis_lookup = dict(zip(df_prod['produkt_id'], df_prod['preis_eur']))

best_dates = pd.to_datetime(
    rng.integers(0, 731, n_b), unit='D', origin='2023-01-01'
).normalize().strftime('%Y-%m-%d')

kunden_ids  = [f"K{i:04d}" for i in rng.integers(1, n_k + 1, n_b)]
produkt_ids = [f"P{i:03d}" for i in rng.integers(1, 51, n_b)]
anzahl_arr  = rng.integers(1, 6, n_b)
preis_arr   = np.array([
    round(preis_lookup[p] * rng.uniform(0.95, 1.05), 2)
    for p in produkt_ids
])
versand_arr = np.round(rng.uniform(0, 9.99, n_b), 2)
ret_arr     = (rng.random(n_b) < 0.15)

# Bewertung: ~30% NaN
bewertung_raw = rng.integers(1, 6, n_b).astype(float)
bew_nan_mask  = rng.random(n_b) < 0.30
bewertung_raw[bew_nan_mask] = np.nan

laender = rng.choice(
    ['Deutschland', 'Österreich', 'Schweiz', 'Frankreich', 'Niederlande'],
    n_b, p=[0.65, 0.12, 0.10, 0.07, 0.06]
)

df_best = pd.DataFrame({
    'bestellnummer': [f"B{i:05d}" for i in range(1, n_b + 1)],
    'datum':         best_dates,
    'kunden_id':     kunden_ids,
    'produkt_id':    produkt_ids,
    'anzahl':        anzahl_arr,
    'preis_eur':     preis_arr,
    'versandkosten': versand_arr,
    'retourniert':   ret_arr,
    'bewertung':     bewertung_raw,
    'land':          laender,
})
df_best.to_csv(OUT / 'ecommerce_bestellungen.csv', index=False)
print(f"  -> {len(df_best)} rows written. Retourenquote: {ret_arr.mean()*100:.1f}%. NaN Bewertungen: {bew_nan_mask.sum()}")

print("\nAll CSV files generated successfully!")
