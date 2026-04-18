# ADR 007: Persistência de Estado Operativo (localStorage)

## Status
Aceito

## Contexto
Em centros de controle (CCO), o operador configura filtros complexos (Bases, Rotas, Veículos). Erros de rede ou a necessidade de recarregar a página (F5) resultavam na perda total dessas configurações, gerando retrabalho e risco operacional.

## Decisão
Implementamos um padrão de **Persistência de Sessão Tática** utilizando `localStorage`. 
- **Filtros**: O estado de `selectedFilters` (Set) é serializado e restaurado automaticamente.
- **Feedback**: Adição de uma notificação de "Sessão Restaurada" para informar o usuário da continuidade.

## Consequências
- **Prós**: Continuidade operacional garantida; melhor UX em conexões instáveis.
- **Contras**: Dependência do armazenamento local do navegador; necessidade de gestão de expiração de cache no futuro se os nomes de grupos mudarem no backend.

## Referências
- [[Unified_Fullscreen_Dashboard]]
- [Tracking Page Implementation](file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/(authenticated)/tracking/page.tsx)
