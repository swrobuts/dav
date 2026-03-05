"""
DAV Lab – Data Generation Script
Generates all synthetic datasets for the Docker learning environment.
Run: python generate_data.py
"""
import pandas as pd
import numpy as np
import sqlite3
import os
import random
from datetime import datetime, timedelta

np.random.seed(42)
random.seed(42)

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

print("Generating DAV Lab datasets...")

# =============================================================================
# 1. customer_churn.csv (1000 rows)
# =============================================================================
print("  [1/6] customer_churn.csv")
n = 1000
ages = np.random.randint(18, 75, n)
tenure = np.random.randint(1, 72, n)
contract_types = np.random.choice(['Month-to-month','One year','Two year'], n, p=[0.5,0.3,0.2])
internet_service = np.random.choice(['DSL','Fiber optic','No'], n, p=[0.4,0.4,0.2])
monthly_charge = np.round(np.random.normal(65, 25, n).clip(20, 120), 2)
total_charges = np.round(monthly_charge * tenure * np.random.uniform(0.9, 1.1, n), 2)
tech_support = np.random.choice(['Yes','No'], n, p=[0.4,0.6])

# Churn: higher for month-to-month, fiber optic, high charges, short tenure
churn_prob = (
    (contract_types == 'Month-to-month') * 0.35 +
    (internet_service == 'Fiber optic') * 0.15 +
    (monthly_charge > 80) * 0.1 +
    (tenure < 12) * 0.2 -
    (tenure > 36) * 0.15
).clip(0, 1)
churn_prob = churn_prob / churn_prob.max() * 0.35
churn = (np.random.random(n) < churn_prob).astype(int)

# Add some missing values
total_charges_missing = total_charges.copy().astype(float)
total_charges_missing[np.random.choice(n, 30, replace=False)] = np.nan

customer_churn = pd.DataFrame({
    'customer_id': [f'C{str(i).zfill(5)}' for i in range(1, n+1)],
    'age': ages,
    'contract_type': contract_types,
    'monthly_charge': monthly_charge,
    'total_charges': total_charges_missing,
    'tenure_months': tenure,
    'internet_service': internet_service,
    'tech_support': tech_support,
    'churn': churn
})
customer_churn.to_csv(os.path.join(DATA_DIR, 'customer_churn.csv'), index=False)
print(f"     {len(customer_churn)} rows, churn rate: {churn.mean()*100:.1f}%")

# =============================================================================
# 2. movies.csv (500 rows)
# =============================================================================
print("  [2/6] movies.csv")
n_movies = 500
genres = ['Action','Comedy','Drama','Thriller','Romance','Sci-Fi','Horror','Animation','Documentary','Adventure']
directors = ['Steven Spielberg','Christopher Nolan','Martin Scorsese','Quentin Tarantino',
             'James Cameron','Ridley Scott','David Fincher','Denis Villeneuve','Greta Gerwig',
             'Ryan Coogler','Bong Joon-ho','Alfonso Cuarón','Sofia Coppola','Kathryn Bigelow']

genre_list = np.random.choice(genres, n_movies)
years = np.random.randint(1990, 2025, n_movies)
ratings = np.round(np.random.beta(5, 2, n_movies) * 4 + 5, 1).clip(1, 10)  # skewed towards 7-8
votes = np.random.randint(1000, 2000000, n_movies)

# Budget varies by genre
budget_base = {'Action': 80, 'Comedy': 25, 'Drama': 20, 'Thriller': 30, 'Romance': 15,
               'Sci-Fi': 100, 'Horror': 15, 'Animation': 70, 'Documentary': 5, 'Adventure': 90}
budget = np.array([np.random.normal(budget_base.get(g, 40), 20) for g in genre_list]).clip(1, 300)
budget = np.round(budget, 1)

# Revenue: correlated with budget + rating + random
revenue_mult = np.random.normal(2.0, 1.0, n_movies).clip(0.1, 8)
revenue = np.round(budget * revenue_mult, 1)

runtime = np.random.randint(80, 180, n_movies)
directors_list = np.random.choice(directors, n_movies)

# Movie titles (generic)
adjectives = ['The Dark','The Last','A New','The Great','Final','Lost','Hidden','Eternal','Wild','Blue']
nouns = ['Hope','Shadow','Journey','Dream','Storm','Fire','Legacy','Return','Horizon','Code']
titles = [f"{random.choice(adjectives)} {random.choice(nouns)} {random.randint(1,999)}" for _ in range(n_movies)]

movies = pd.DataFrame({
    'title': titles,
    'year': years,
    'genre': genre_list,
    'rating': ratings,
    'votes': votes,
    'budget_mio': budget,
    'revenue_mio': revenue,
    'director': directors_list,
    'runtime_min': runtime
})
movies.to_csv(os.path.join(DATA_DIR, 'movies.csv'), index=False)
print(f"     {len(movies)} rows, avg rating: {ratings.mean():.2f}")

# =============================================================================
# 3. used_cars_extended.csv (1000 rows)
# =============================================================================
print("  [3/6] used_cars_extended.csv")
n_cars = 1000
brands = ['BMW','Mercedes','VW','Audi','Toyota','Ford','Opel','Skoda','Hyundai','Kia']
fuel_types = ['Benzin','Diesel','Elektro','Hybrid']
transmissions = ['Automatik','Manuell']
colors = ['Schwarz','Weiß','Grau','Silber','Blau','Rot','Grün','Braun']

car_brand = np.random.choice(brands, n_cars)
car_year = np.random.randint(2005, 2024, n_cars)
mileage = np.random.randint(0, 250000, n_cars)
fuel = np.random.choice(fuel_types, n_cars, p=[0.5,0.3,0.1,0.1])
transmission = np.random.choice(transmissions, n_cars, p=[0.6,0.4])
color = np.random.choice(colors, n_cars)
engine_size = np.round(np.random.choice([1.0,1.2,1.4,1.6,1.8,2.0,2.5,3.0,4.0], n_cars), 1)
doors = np.random.choice([2,3,4,5], n_cars, p=[0.05,0.1,0.6,0.25])

# Price model: newer, fewer km, premium brand → higher price
brand_premium = {'BMW': 8000,'Mercedes': 9000,'Audi': 7000,'VW': 3000,
                 'Toyota': 2000,'Ford': 1000,'Opel': 500,'Skoda': 1500,'Hyundai': 1500,'Kia': 1500}
base_price = 5000
price = (base_price
    + (car_year - 2005) * 800
    - mileage * 0.05
    + np.array([brand_premium[b] for b in car_brand])
    + np.random.normal(0, 2000, n_cars)
).clip(500, 80000)
price = np.round(price, -2)  # Round to hundreds

# Add some missing values
mileage_missing = mileage.copy().astype(float)
mileage_missing[np.random.choice(n_cars, 25, replace=False)] = np.nan

used_cars = pd.DataFrame({
    'brand': car_brand,
    'year': car_year,
    'mileage': mileage_missing,
    'fuel_type': fuel,
    'transmission': transmission,
    'color': color,
    'engine_size': engine_size,
    'doors': doors,
    'price': price
})
used_cars.to_csv(os.path.join(DATA_DIR, 'used_cars_extended.csv'), index=False)
print(f"     {len(used_cars)} rows, avg price: {price.mean():.0f} EUR")

# =============================================================================
# 4. customers.csv (Kundendaten for merging exercise)
# =============================================================================
print("  [4/6] customers.csv")
n_customers = 200
cities = ['München','Berlin','Hamburg','Frankfurt','Köln','Stuttgart','Düsseldorf','Nürnberg','Bremen','Leipzig']
first_names = ['Anna','Max','Lisa','Tom','Maria','Peter','Julia','Klaus','Sandra','Michael']
last_names = ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Koch']

customers = pd.DataFrame({
    'customer_id': range(1, n_customers + 1),
    'vorname': np.random.choice(first_names, n_customers),
    'nachname': np.random.choice(last_names, n_customers),
    'email': [f"{random.choice(first_names).lower()}.{random.choice(last_names).lower()}@email.de" for _ in range(n_customers)],
    'city': np.random.choice(cities, n_customers),
    'plz': [str(np.random.randint(10000, 99999)) for _ in range(n_customers)],
    'alter': np.random.randint(18, 70, n_customers),
    'kundenstatus': np.random.choice(['Premium','Standard','Basic'], n_customers, p=[0.2,0.5,0.3])
})
customers.to_csv(os.path.join(DATA_DIR, 'customers.csv'), index=False)
print(f"     {len(customers)} rows")

# =============================================================================
# 5. orders.csv (Bestelldaten for merging exercise)
# =============================================================================
print("  [5/6] orders.csv")
n_orders = 800
start_date = datetime(2023, 1, 1)
product_ids = list(range(1, 51))

orders = pd.DataFrame({
    'order_id': range(1001, 1001 + n_orders),
    'customer_id': np.random.randint(1, n_customers + 1, n_orders),
    'product_id': np.random.choice(product_ids, n_orders),
    'bestelldatum': [start_date + timedelta(days=np.random.randint(0, 365)) for _ in range(n_orders)],
    'menge': np.random.randint(1, 10, n_orders),
    'status': np.random.choice(['abgeschlossen','in_bearbeitung','storniert'], n_orders, p=[0.7,0.2,0.1])
})
orders['bestelldatum'] = orders['bestelldatum'].dt.strftime('%Y-%m-%d')
orders.to_csv(os.path.join(DATA_DIR, 'orders.csv'), index=False)
print(f"     {len(orders)} rows")

# =============================================================================
# 6. products.csv (Produktdaten for merging exercise)
# =============================================================================
print("  [6/6] products.csv")
categories = ['Elektronik','Kleidung','Lebensmittel','Sport','Bücher','Möbel','Spielzeug','Kosmetik']
product_names = ['Widget Pro','Gadget Plus','SuperItem','MegaProduct','UltraGear']

products = pd.DataFrame({
    'product_id': range(1, 51),
    'produktname': [f"{random.choice(product_names)} {chr(65 + i % 26)}{i}" for i in range(50)],
    'kategorie': np.random.choice(categories, 50),
    'preis': np.round(np.random.uniform(5, 500, 50), 2),
    'lagerbestand': np.random.randint(0, 1000, 50),
    'lieferant': np.random.choice(['Lieferant A','Lieferant B','Lieferant C','Lieferant D'], 50)
})
products.to_csv(os.path.join(DATA_DIR, 'products.csv'), index=False)
print(f"     {len(products)} rows")

# =============================================================================
# 7. dav_sample.db (SQLite with all tables)
# =============================================================================
print("  [+] dav_sample.db (SQLite)")
db_path = os.path.join(DATA_DIR, 'dav_sample.db')
conn = sqlite3.connect(db_path)

customer_churn.to_sql('customer_churn', conn, if_exists='replace', index=False)
movies.to_sql('movies', conn, if_exists='replace', index=False)
used_cars.to_sql('used_cars', conn, if_exists='replace', index=False)
customers.to_sql('customers', conn, if_exists='replace', index=False)
orders.to_sql('orders', conn, if_exists='replace', index=False)
products.to_sql('products', conn, if_exists='replace', index=False)

conn.execute("""
    CREATE VIEW IF NOT EXISTS v_orders_customers AS
    SELECT o.order_id, o.bestelldatum, o.menge, o.status,
           c.vorname, c.nachname, c.city, c.kundenstatus,
           p.produktname, p.kategorie, p.preis
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.customer_id
    LEFT JOIN products p ON o.product_id = p.product_id
""")
conn.commit()
conn.close()
print(f"     SQLite DB created: {os.path.getsize(db_path) / 1024:.0f} KB")

print()
print("All datasets generated successfully!")
print(f"Output directory: {DATA_DIR}")
print()
for f in ['customer_churn.csv','movies.csv','used_cars_extended.csv','customers.csv','orders.csv','products.csv','dav_sample.db']:
    path = os.path.join(DATA_DIR, f)
    if os.path.exists(path):
        print(f"  {f}: {os.path.getsize(path)/1024:.1f} KB")
