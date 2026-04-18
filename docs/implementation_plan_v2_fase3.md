# SDD 007: Inteligência de Localização e Street View (Fase 3)

Este documento especifica a implementação do Street View isolado e o refino da busca geográfica contextual.

## User Review Required

> [!IMPORTANT]
> O Street View será carregado sob demanda (On-Demand), economizando recursos do sistema ao não pré-carregar scripts do Google Maps.

## Proposed Changes

### [Frontend] Rastreamento Tático

#### [NEW] [StreetViewModal](file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/%28authenticated%29/tracking/StreetViewModal.tsx)
- Modal responsivo com carregamento de Iframe do Street View.
- Loader integrado para o tempo de resposta da API do Google.

#### [MODIFY] [Tracking Page](file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/%28authenticated%29/tracking/page.tsx)
- Adicionar estado `isGeocoding` para feedback no campo de busca.
- Implementar transição de `flyTo` aprimorada para resultados Nominatim.

## Plano de Verificação

### Testes Manuais
- [ ] Digitar "Avenida Paulista" no campo de busca, apertar Enter e validar se o mapa foca na região.
- [ ] Abrir o Street View de um carro em rodovia e validar se a imagem corresponde à posição no mapa.
