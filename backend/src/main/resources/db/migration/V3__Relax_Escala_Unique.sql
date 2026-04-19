-- V3: Relaxing Unique Constraint on escala_fluxo
-- SQLite doesn't support DROP CONSTRAINT, so we must recreate the table

CREATE TABLE escala_fluxo_new (
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
    servico TEXT NOT NULL
);

INSERT INTO escala_fluxo_new (id, dia_semana, data_escala, garagem, carro, horario_garagem, horario_saida, origem, destino, motorista, linha, servico)
SELECT id, dia_semana, data_escala, garagem, carro, horario_garagem, horario_saida, origem, destino, motorista, linha, servico FROM escala_fluxo;

DROP TABLE escala_fluxo;

ALTER TABLE escala_fluxo_new RENAME TO escala_fluxo;
