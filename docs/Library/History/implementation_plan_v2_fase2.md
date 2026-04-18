# SDD 006: Refino Cartográfico e Conforto Visual (Fase 2)

Este documento especifica a implementação do Modo Noturno e melhorias semânticas na interface de rastreamento.

## User Review Required

> [!IMPORTANT]
> A mudança no Modo Noturno abandonará a inversão de cores (`invert`) em favor de filtros de `brightness` e `contrast`, preservando a integridade das cores dos status dos veículos.

## Proposed Changes

### [Frontend] Rastreamento Tático

#### [MODIFY] [MapComponent](file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/%28authenticated%29/tracking/MapComponent.tsx)

- Substituir a classe de inversão de cores por uma lógica de filtros de luminância.
- Aplicar o filtro apenas na camada de tiles (`.leaflet-tile-pane`).

#### [MODIFY] [Tracking Page](file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/%28authenticated%29/tracking/page.tsx)

- Atualizar a string do botão de filtro de ocorrências para "FILTRAR OCORRÊNCIAS".

## Plano de Verificação

### Testes Manuais

- [ ] Ativar o Modo Noturno e verificar se as cores dos veículos (Verde, Laranja) continuam sendo percebidas corretamente.
- [ ] Validar a legibilidade dos nomes das rodovias no OpenStreetMap.DE com o filtro de redução de brilho.
