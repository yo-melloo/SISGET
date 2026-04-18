# Flashcards: Maestria em Monitoramento SISGET (v2.0)

Este banco de cartões foca na retenção de sintaxe e conceitos críticos de engenharia de dashboards.

---

### Cartão 01: Renderização de Massa
**Q:** Qual propriedade do Leaflet (`MapContainer`) deve ser ativada para garantir fluidez no zoom ao lidar com centenas de marcadores (100+)?
**A:** `preferCanvas={true}`. Isso troca a renderização SVG (cara no DOM) por renderização em bitmap único.

---

### Cartão 02: Ajuste de Layout Dinâmico
**Q:** Por que marcadores podem parecer "desalinhados" ou o mapa pode não preencher 100% da tela após fechar uma sidebar lateral?
**A:** Porque o motor Leaflet não detecta mudanças de tamanho via CSS automaticamente. É necessário chamar o método `invalidateSize()` da instância do mapa.

---

### Cartão 03: Persistência de Dados (Set)
**Q:** Como persistir um estado do tipo `Set` no `localStorage` do navegador?
**A:** É necessário converter o `Set` para um `Array` via `Array.from()` antes de usar `JSON.stringify()`, e reconstruir o `Set` no carregamento.

---

### Cartão 04: Ergonomia de Comando (LockFocus)
**Q:** Em uma interface de CCO, qual a função da funcionalidade "LockFocus" (ícone de mira)?
**A:** Travar a câmera do mapa nas coordenadas de um veículo específico, criando uma "escolta" ativa independente da movimentação manual do operador.

---

### Cartão 05: Performance Cartográfica (Tiles)
**Q:** O que acontece se o provedor de mapas (ex: OSM) bloquear requisições? Qual o mecanismo de defesa implementado no SISGET?
**A:** O listener `tileerror` dispara uma notificação ao usuário sugerindo a troca de provedor tático (ex: mudar para visão de Satélite do ArcGIS).
