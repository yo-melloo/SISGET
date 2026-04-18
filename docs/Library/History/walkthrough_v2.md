# Walkthrough: Rastreamento Tático v2.0 - Fase 1

Este documento descreve as implementações realizadas para restaurar a inteligência de localização e a flexibilidade de visualização do SISGET.

## 🚀 Implementações Realizadas

### 1. Restauração do MCR (DNIT GeoServer)
- **O Desafio:** A API legada do DNIT foi desativada (404).
- **A Solução:** Migramos a integração para o novo GeoServer WFS. Implementamos uma busca espacial com **Buffer de 500m** para compensar imprecisões de GPS.
- **Resultado:** Localização federal precisa (ex: `BR-153/TO KM 450`) exibida no painel de detalhes.

### 2. Controle de Exibição Dinâmico (Item 9)
- **Interface:** Adição de uma Combobox tática na barra lateral.
- **Inteligência:** O componente agrupa automaticamente veículos por **Bases (Garagens)** e **Rotas**.
- **Performance:** Filtros aplicados no frontend para garantir latência zero.

---

## 🛠️ Como Testar

1. **Filtros por Base:** 
   - Abra a página de Rastreamento.
   - Na barra lateral, clique em "Filtrar por Grupo...".
   - Selecione a Base **"IMPERATRIZ"**.
   - **Observação:** Todos os carros que não pertencem a essa base desaparecerão do mapa e da lista.

2. **Detecção MCR:**
   - Selecione um veículo que esteja em rodovia federal (ex: **Reginaldo - 25006**).
   - Verifique o campo **"Localização Federal (DNIT)"**. Ele deve exibir o KM exato.

---

## 🔗 Próximos Passos
- [x] Implementar **OpenStreetMap.DE** (Item 2).
- [x] Implementar **Filtro de Conforto Visual** para o **Modo Noturno** (Item 11).
