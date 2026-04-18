# SDD 008: Estabilização de Performance do Mapa (Correção de Bugs)

Este documento especifica as correções para os problemas de renderização (Zoom e Transição de Temas).

## User Review Required

> [!IMPORTANT]
> A transição entre Standard e Modo Noturno agora será instantânea via CSS/Props, sem recarregar os dados ou o motor Leaflet.

## Proposed Changes

### [Frontend] Rastreamento ~Tático~ (pare de usar "tático")

Você notou se a explosão ocorre apenas em um nível de zoom específico ou em qualquer transição de zoom?
-- Qualquer transição de zoom

#### [MODIFY] [MapComponent](file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/%28authenticated%29/tracking/MapComponent.tsx)

- Remover a `key` dinâmica do `MapContainer`.
- Adicionar `preferCanvas={true}` para suavizar a renderização dos marcadores.
- Ajustar `pathOptions` para evitar recalculos agressivos durante o zoom.

## Plano de Verificação

### Testes Manuais

- [ ] Alternar entre Modo Noturno e Satélite e validar se a transição é instantânea.
- [ ] Realizar zoom in/out rapidamente e validar se os marcadores mantêm o tamanho consistente.
