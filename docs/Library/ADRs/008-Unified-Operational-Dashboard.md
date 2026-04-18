# ADR 008: Arquitetura de Dashboard Operacional Unificado

## Status
Aceito

## Contexto
O monitoramento de frotas exige atenção plena. Versões anteriores do sistema possuíam controles de tela cheia fragmentados (apenas o mapa), o que escondia painéis vitais de pesquisa e detalhes de veículos, quebrando o fluxo de trabalho do operador.

## Decisão
Implementamos um escopo de **Fullscreen Global** que abrange o container principal da aplicação. 
- **Hierarquia Visual**: Utilizamos um sistema de camadas (`z-index`) para garantir que a Sidebar de Frota e o Painel de Detalhes flutuem sobre o mapa sem obstruir os controles cartográficos.
- **Toggle Dinâmico**: Adicionamos uma Sidebar Colapsável para maximizar a área de visão sob demanda, mantendo a capacidade de pesquisa instantânea.

## Consequências
- **Prós**: Interface imersiva no estilo CCO; acesso contínuo a ferramentas de busca em qualquer modo de exibição.
- **Contras**: Complexidade adicional no gerenciamento de redimensionamento do motor Leaflet (`invalidateSize`).

## Referências
- [[Unified_Fullscreen_Dashboard]]
- [[Interactive_Tracking_Standard]]
