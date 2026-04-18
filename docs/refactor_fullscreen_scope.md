# SDD 010: Refatoração do Modo Tela Cheia (Escopo Global)

Este documento detalha a migração do controle de Fullscreen para o container principal, garantindo a visibilidade do contexto operativo (painéis e busca).

## User Review Required

> [!IMPORTANT]
> A tela cheia agora incluirá o Painel de Detalhes. Isso resolve o problema de "perda de controle" ao expandir o mapa.

## Proposed Changes

### [Frontend] Layout Operativo

#### [MODIFY] [Tracking Page](file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/%28authenticated%29/tracking/page.tsx)

- Implementação de `useFullscreen` customizado.
- Ajuste de `z-index` nos overlays.

#### [MODIFY] [MapComponent](file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/%28authenticated%29/tracking/MapComponent.tsx)

- Remoção do gerenciamento local de Fullscreen.
- Acionamento via callback.

## Plano de Verificação

### Testes Manuais

- [ ] Ativar tela cheia e selecionar um veículo: o painel lateral deve aparecer.
- [ ] Abrir a busca em tela cheia: a geocodificação deve continuar reposicionando o mapa.
