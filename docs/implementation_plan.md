# SDD 005: Controle de Exibição Dinâmico (Multi-select)

Este documento especifica a implementação da filtragem seletiva de frota via interface tática, permitindo agrupar veículos por instâncias operacionais.

## User Review Required

> [!IMPORTANT]
> A filtragem será aplicada no `frontend`, garantindo resposta instantânea sem novas chamadas ao banco de dados, mantendo a performance do sistema.

## Proposed Changes

### [Frontend] Módulo de Rastreamento

#### [NEW] [MultiSelectCombobox.tsx](<file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/(authenticated)/tracking/MultiSelectCombobox.tsx>)

- **Funcionalidade:** Searchable select com suporte a múltiplos checkboxes.
- **Design:** Glassmorphism, bordas suaves, tipografia Outfit.
- **Interação:** Exibir "Badge" com a contagem de itens selecionados.

#### [MODIFY] [tracking/page.tsx](<file:///d:/Repositorios/solucoes-excel/SISGET/frontend/src/app/(authenticated)/tracking/page.tsx>)

- Adição de estados para `selectedFilters` (Set<string>).
- Refatoração de `filteredFleet` para considerar a interseção de:
  - `searchTerm` (Busca Universal)
  - `onlyOccurrences` (Toggle de Alertas)
  - `selectedFilters` (Filtro por Rota/Base)

## Open Questions

1. **Agrupamento:** Na lista lateral, deseja que os veículos sejam agrupados visualmente pelos filtros selecionados (ex: Accordions por Rota)?

2. **Persistência:** Devemos memorizar os filtros selecionados no `localStorage`?
   -- Não precisa persistir os filtros, atualmente a velocidade do aplicativo é muito boa, persistir os filtros em caso de F5 pode ser interpretado como bug.
   -- A lista do combobox era pra ser focada em número de carros, mas me deu um insight de que poderíamos ter um filtro por bases (exemplo: filtrar carros que estão na garagem de São Luís - Ponte para implementação com fluxo de frota). Isso é ótimo.

## Plano de Verificação

### Testes Manuais

- [ ] Selecionar uma Rota específica e verificar se apenas os carros dela permanecem no mapa.
- [ ] Combinar busca por Placa com filtro de Rota e validar o resultado vazio caso não haja match.
