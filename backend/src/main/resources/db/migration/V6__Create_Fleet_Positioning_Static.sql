CREATE TABLE IF NOT EXISTS fleet_positioning_static (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT NOT NULL,
    base TEXT NOT NULL,
    category TEXT NOT NULL,
    schedule TEXT,
    origin TEXT,
    destination TEXT,
    end_date TEXT,
    notes TEXT
);
