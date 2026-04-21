-- Ajuste do módulo de Garagem (Tanques e Reservas)
-- V1 já possuía definições básicas. Aqui expandimos com os campos necessários.

-- Adicionando colunas ausentes em 'tanques'
ALTER TABLE tanques ADD COLUMN capacidade_l REAL;
ALTER TABLE tanques ADD COLUMN medicao_cm REAL;
ALTER TABLE tanques ADD COLUMN volume_l REAL;
ALTER TABLE tanques ADD COLUMN atualizado_em DATETIME;
ALTER TABLE tanques ADD COLUMN atualizado_por TEXT;

-- Migrando dados antigos se existirem
UPDATE tanques SET capacidade_l = capacidade_max, medicao_cm = nivel_atual_cm;

-- Reservas já existia em V1, mas garantimos os mesmos campos
-- Se houver necessidade de novos campos em reservas, adicionar via ALTER aqui.

-- Seed de Tanques Iniciais para Imperatriz (ITZ) se a tabela estiver vazia
INSERT INTO tanques (nome, capacidade_l, medicao_cm, volume_l, atualizado_em, atualizado_por)
SELECT 'Tanque Diesel 01', 15000, 110, 10450, DATETIME('now'), 'SISTEMA'
WHERE NOT EXISTS (SELECT 1 FROM tanques WHERE nome = 'Tanque Diesel 01');

INSERT INTO tanques (nome, capacidade_l, medicao_cm, volume_l, atualizado_em, atualizado_por)
SELECT 'Tanque Diesel 02', 15000, 90, 8550, DATETIME('now'), 'SISTEMA'
WHERE NOT EXISTS (SELECT 1 FROM tanques WHERE nome = 'Tanque Diesel 02');
