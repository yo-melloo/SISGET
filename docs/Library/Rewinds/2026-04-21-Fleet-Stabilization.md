# Rewind: Estabilização de Frota e Persistência de Notas
**Data:** 21/04/2026
**Commit:** `1374769`

## 🧩 Problemas Identificados

1.  **Deadlock de Layout (Flexbox)**: O uso de `flex-1` no container principal impedia o overflow horizontal, "travando" o scroll mesmo com `overflow-x-auto`.
2.  **Bloqueio de Pop-ups**: O Chrome estava bloqueando o `window.confirm` e `alert` nativos, impedindo a exclusão de registros sem feedback visual.
3.  **Persistência Local**: As notas de operação estavam limitadas ao `localStorage`, impedindo que auxiliares de tráfego de diferentes plantões compartilhassem informações.

## 🛠️ Decisões Técnicas

### 1. Layout & Scroll
- **Solução**: Aplicação de `min-w-0` em containers Flexbox profundos para permitir que os elementos filhos encolham e ativem a barra de rolagem.
- **Estética**: Scrollbars customizadas com `glassmorphism` para manter o visual premium.

### 2. Modais & Notificações
- **Solução**: Implementação de um `ConfirmModal` customizado para exclusões e integração da biblioteca `sonner` para notificações táticas (`toasts`).
- **Benefício**: UI imune a bloqueadores de pop-up e feedback visual imediato para o usuário.

### 3. Migração de Persistência (SDD)
- **Ação**: Criação da entidade `FleetNote` no backend com migração Flyway (V8).
- **Arquitetura**: Transição de `localStorage` para API REST (`/api/fleet/notes`), garantindo sincronização total entre usuários.

## 🧪 Validação
- Build do Backend: ✅ Sucesso
- Build do Frontend: ✅ Sucesso (Turbopack)
- Testes Manuais: Exclusão funcional, scroll ativo e persistência de notas sincronizada.

---
*Documento gerado automaticamente pelo @mentor como parte do ciclo de checkpoint.*
