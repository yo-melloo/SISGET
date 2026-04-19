import sqlite3
import os

db_path = "backend/sisget.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT vehicle_id, latitude, longitude, mcr_location, city_location FROM fleet_current WHERE vehicle_id = '20017'")
    row = cursor.fetchone()
    if row:
        print(f"20017: {row}")
    else:
        print("20017 not found")
    conn.close()
else:
    print(f"DB not found at {db_path}")
