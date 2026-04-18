# Rewind 001: Módulo de Rastreamento - Alta Performance e Resiliência

Esta nota sintetiza os conceitos técnicos fundamentais do Ciclo v2.0, focando em como transformamos uma aplicação React comum em um Dashboard Operacional de alto impacto.

## 🧠 Conceitos-Chave

### 1. Motor de Renderização: Canvas vs SVG
O Leaflet, por padrão, renderiza marcadores como SVGs. Para frotas grandes, o custo de manipular centenas de nós no DOM é proibitivo.
- **Mastery Note:** O uso de `preferCanvas={true}` delega a renderização para uma única camada de bitmap, reduzindo a carga de CPU.

### 2. Gestão de Ciclo de Vida e `invalidateSize`
Interfaces colapsáveis (Sidebars) mudam as dimensões do container do mapa. O Leaflet não detecta isso automaticamente via CSS.
- **Prática:** É necessário disparar `map.invalidateSize()` após o término das animações de layout para recalcular o centro e os limites (bounds).

---

## 🔍 Investigação Reflexiva (Desafio de Pesquisa)

Como seu **@mentor**, exijo que você fundamente as decisões que tomamos. Responda (e pesquise se necessário):

1.  **Pesquisa Obrigatória:** Como o Leaflet gerencia o ciclo de vida do `MapContainer` dentro do ecossistema React para evitar vazamentos de memória (*memory leaks*) ao alternar rotas ou destruir componentes? 
    - *Dica: Pesquise sobre a relação entre instâncias de objetos Leaflet e o `useEffect` de limpeza.*

2.  **Raciocínio Crítico:** Por que optamos por persistir os filtros no `localStorage` em vez de salvá-los no estado do servidor (banco de dados) para cada usuário? Quais os prós e contras dessa decisão em termos de latência e custo de infraestrutura?

---

## 🛠️ Trade-offs de Design
- **LockFocus:** Trocamos a liberdade total de câmera por uma "escolta" ativa para garantir vigilância.
- **Global Fullscreen:** Sacrificamos a visibilidade do resto da aplicação em prol da imersão tática.

## 🔗 Referências de Estudo
- [[Leaflet_Canvas_Performance]]
- [[Unified_Fullscreen_Dashboard]]
- [[007-State-Persistence-Pattern]]

---
> [!TIP]
> Use as tags `#rewind` e `#tracking` para organizar esta nota no seu Obsidian.
