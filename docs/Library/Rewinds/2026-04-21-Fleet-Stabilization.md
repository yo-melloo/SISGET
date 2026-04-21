# Rewind: Estabilização de Frota e Persistência de Notas
**Data:** 21/04/2026
**Commit:** `1374769`

## 🧩 Problemas Identificados

1.  **Deadlock de Layout (Flexbox)**: O uso de `flex-1` no container principal impedia o overflow horizontal, "travando" o scroll mesmo com `overflow-x-auto`.
2.  **Bloqueio de Pop-ups**: O Chrome estava bloqueando o `window.confirm` e `alert` nativos, impedindo a exclusão de registros sem feedback visual.
3.  **Persistência Local**: As notas de operação estavam limitadas ao `localStorage`, impedindo que auxiliares de tráfego de diferentes plantões compartilhassem informações.
4.  **Incerteza do ETA**: A coluna de Previsão dependia exclusivamente de preenchimento manual (ou ficava vazia), causando lacunas na estimativa de chegada em Imperatriz.

## 🛠️ Decisões Técnicas

### 1. Layout & Scroll
... (sem alterações)

### 3. Migração de Persistência (SDD)
- **Ação**: Criação da entidade `FleetNote` no backend com migração Flyway (V8).
- **Arquitetura**: Transição de `localStorage` para API REST (`/api/fleet/notes`), garantindo sincronização total entre usuários.

### 4. Motor de ETA (Matemática Pura)
- **Ponto de Referência (Garagem ITZ)**: DMS `5°29'27.1"S 47°28'07.9"W` convertido para precisão decimal.
- **Modelo de Previsão**:
  - Distância via **Haversine** (geodésica).
  - **Fator Rodoviário (1.35x)** para compensar sinuosidade e relevo.
  - **Overhead Operacional (+40 min)** para paradas em trajetos longos (>100km).
- **UI Ergonomics**: Horário de chegada em formato de parede (Clock time) com fonte ampliada (`text-lg`) e pulse animado para dados vivos.

## 🧪 Validação
- Build do Backend: ✅ Sucesso
- Build do Frontend: ✅ Sucesso (Turbopack)
- Testes Manuais: Exclusão funcional, scroll ativo e persistência de notas sincronizada.

---
*Documento gerado automaticamente pelo @mentor como parte do ciclo de checkpoint.*
