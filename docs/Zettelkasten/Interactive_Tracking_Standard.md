# SDD 011: Refatoração de Escopo Visual e Trava de Foco (LockFocus)

Este documento detalha a migração do Fullscreen para escopo global e a criação da funcionalidade de bloqueio de foco.

## User Review Required

> [!IMPORTANT]
> A "Trava de Foco" permitirá que o operador mantenha o painel lateral aberto enquanto navega livremente pelo mapa de outros estados/regiões.

## Proposed Changes

### [Frontend] Rastreamento

#### [MODIFY] [Tracking Page](file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/%28authenticated%29/tracking/page.tsx)
- Implementação de `lockFocus` no estado global do rastreamento.
- Re-ligação do botão de Fullscreen para o container pai.

#### [MODIFY] [MapComponent](file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/%28authenticated%29/tracking/MapComponent.tsx)
- Lógica de acompanhamento reativo baseada em `lockFocus`.

## Plano de Verificação

### Testes Manuais
- [ ] Ativar "Trava de Foco" (Unlock) e mover o mapa manualmente: o mapa NÃO deve voltar para o carro no próximo refresh de dados.
- [ ] Ativar "Trava de Foco" (Lock) e aguardar refresh: o mapa deve acompanhar a nova posição do veículo.
