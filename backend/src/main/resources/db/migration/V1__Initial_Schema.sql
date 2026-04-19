-- V1: Initial Schema for SISGET

-- Existing Tables (to be brought into Flyway management)
CREATE TABLE IF NOT EXISTS escala_fluxo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dia_semana TEXT NOT NULL,
    data_escala DATE NOT NULL,
    garagem TEXT,
    carro TEXT,
    horario_garagem TIME,
    horario_saida TIME,
    origem TEXT,
    destino TEXT,
    motorista TEXT,
    linha TEXT,
    servico TEXT NOT NULL,
    UNIQUE(data_escala, servico, origem, destino)
);

CREATE TABLE IF NOT EXISTS fleet_current (
    vehicle_id TEXT PRIMARY KEY,
    plate TEXT,
    latitude REAL,
    longitude REAL,
    speed REAL,
    driver_name TEXT,
    route_name TEXT,
    area_name TEXT,
    status TEXT,
    transmission_date TEXT,
    odometer TEXT,
    fuel_level TEXT,
    category TEXT,
    rpm TEXT,
    mcr_location TEXT,
    last_backend_update DATETIME
);

CREATE TABLE IF NOT EXISTS fleet_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT,
    latitude REAL,
    longitude REAL,
    speed REAL,
    status TEXT,
    transmission_date TEXT,
    recorded_at DATETIME
);

CREATE TABLE IF NOT EXISTS fleet_occurrences (
    vehicle_id TEXT PRIMARY KEY,
    occurrence_text TEXT,
    last_updated DATETIME
);

-- New Core Entities for TASK-003
CREATE TABLE IF NOT EXISTS motoristas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    matricula TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS veiculos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prefixo TEXT UNIQUE NOT NULL,
    placa TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL,
    tipo TEXT NOT NULL, -- CARRO / PNEU
    status TEXT NOT NULL, -- DISPONÍVEL / INDISPONÍVEL
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS tanques (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    capacidade_max REAL DEFAULT 15000.0,
    nivel_atual_cm REAL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS calibracao_tanques (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cm REAL NOT NULL,
    litros REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricula TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    nome TEXT NOT NULL,
    cargo TEXT
);
