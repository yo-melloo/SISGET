# SDD 009: Controle Operativo e Geolocalização de Dispositivo

Este documento detalha a implementação dos novos controles de interface do mapa para melhor visualização e localização.

## User Review Required

> [!IMPORTANT]
> O modo "Tela Cheia" utiliza a API padrão do navegador. Alguns navegadores podem sair do modo tela cheia automaticamente se houver navegação entre páginas.

## Proposed Changes

### [Frontend] Rastreamento

#### [MODIFY] [MapComponent](file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/%28authenticated%29/tracking/MapComponent.tsx)
- Inserção de botões para **Fullscreen** (Maximize) e **Auto-Localização** (LocateFixed).
- Lógica de centralização em cascata (Frota -> Dispositivo).

## Plano de Verificação

### Testes Manuais
- [ ] Clicar no botão de tela cheia e validar se o mapa ocupa 100% do monitor.
- [ ] Clicar no botão de mira e autorizar o GPS: validar se o mapa foca na posição atual do usuário.
