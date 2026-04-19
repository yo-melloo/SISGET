-- V2: Seed fixed administrative data

-- Insert initial administrator
-- Password "5418" hashed with BCrypt
INSERT INTO usuarios (matricula, senha, nome, cargo) 
VALUES ('5418', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.TVuHOn2', 'Gustavo Oliveira Melo', 'Administrador');

-- Insert initial tanks
INSERT INTO tanques (nome, capacidade_max, nivel_atual_cm) VALUES ('Tanque 01', 15000.0, 0.0);
INSERT INTO tanques (nome, capacidade_max, nivel_atual_cm) VALUES ('Tanque 02', 15000.0, 0.0);
