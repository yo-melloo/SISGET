# 🚀 Plano de Enhancement: Sistema de Rastreamento (v2.0)
**Foco:** Unificação de Performance, UX Tática e Inteligência de Dados.

## 🛠️ Interface e Experiência do Usuário (UX)
- [ ] **1. Input de Pesquisa Universal:** Centralizar a busca para aceitar Placas, Prefixos e Nomes de Motoristas em um único campo.
- [ ] **1.5. Geocodificação Contextual:** Realizar `flyTo` para regiões geográficas se o input não for veículo.
- [/] **2. Padronização Cartográfica:** Substituir provedores pelo **OpenStreetMap.DE** via Leaflet.
- [ ] **3. Street View On-Demand:** Implementar componente pop-up isolado (remover SDK global).
- [x] **4. Timeline de Sincronia:** Adicionar label com timestamp da última atualização.
- [x] **7. Feedback de Carregamento:** Animação de spin durante processamento de dados.
- [/] **8. Refino Semântico:** "FILTRAR OCORRÊNCIAS" em vez de "TODAS AS OCORRÊNCIAS".

## 🌙 Gestão Visual (Modo Noturno)
- [ ] **11. Filtro de Conforto Visual:** Em vez de inversão de cores (que gera os "rabiscos"), aplicar filtro CSS de `brightness` e `contrast` no container de tiles do OSM.DE para reduzir o desgaste visual noturno sem perder a hierarquia das vias.
- [ ] **12. Validação de Contraste:** Ativar o Modo Noturno e verificar se as cores dos veículos (Verde, Laranja) continuam sendo percebidas corretamente.

## 🐛 Estabilidade e Bugs
- [x] **5. Correção de Drift do Mapa:** Resolver deslocamento para a esquerda sob foco.
- [x] **6. Limpeza de Marca (UI):** Remover "Rastreamento Tático" estático.

## 📊 Inteligência de Dados e Filtros
- [x] **9. Controle de Exibição Dinâmico:** Combobox com checkbox para filtragem seletiva de múltiplos veículos ou grupos no mapa.
- [x] **10. Implementação do MCR (Módulo de Contexto Rodoviário):**
    - [x] Integrar API do DNIT (GeoServer WFS).
    - [x] Aplicar lógica de humanização e mapping CamelCase.

---
**Status Contextual:** Infraestrutura DNIT/MCR validada e estável. Iniciando refinamento de UX (Item 9).
