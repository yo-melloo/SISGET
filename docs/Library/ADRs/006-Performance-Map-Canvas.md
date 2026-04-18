# ADR 006: Renderização de Alta Performance via Canvas

## Status
Aceito

## Contexto
Durante o monitoramento de frotas com 100+ veículos, notamos uma instabilidade visual ("explosão" de marcadores) e queda de taxa de quadros (FPS) durante o zoom no Leaflet. O navegador estava sobrecarregado pela gestão de centenas de elementos SVG no DOM.

## Decisão
Decidimos forçar a renderização do mapa utilizando o elemento **HTML5 Canvas** (`preferCanvas={true}`). 

Além disso, implementamos a invalidação de tamanho (`invalidateSize`) sincronizada com transições de layout (sidebar colapsável) para garantir que o motor de renderização sempre utilize 100% da área disponível sem gerar áreas "mortas" ou desalinhadas.

## Consequências
- **Prós**: Fluidez absoluta no zoom, mesmo com centenas de unidades; Redução drástica do uso de memória do navegador.
- **Contras**: Perda da capacidade de estilizar marcadores via CSS puro (exige manipulação via Leaflet PathOptions).
- **Segurança**: Operação de CCO garantida sem travamentos em momentos críticos.

## Referências
- [[Leaflet_Canvas_Performance]]
- [[Map_Component_Implementation]]
