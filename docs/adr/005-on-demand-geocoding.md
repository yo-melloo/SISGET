# ADR 005: On-Demand Reverse Geocoding and Persistent Caching

**Status:** Aceito
**Data:** 19-04-2026
**Contexto:**
O sistema SISGET requer a exibição de localização em tempo real (Cidade/Estado) para a frota. O provedor gratuito Nominatim (OSM) possui limites de taxa rigorosos (1 req/s). Geocodificar toda a frota (160+ veículos) durante o carregamento da lista causava bloqueios 429 e latência inaceitável na UI.

**Decisão:**
1.  **Geocodificação Sob Demanda:** A resolução de endereço foi movida da listagem principal para os pop-ups de detalhes do veículo. A requisição à API externa só ocorre quando o usuário foca em um carro específico.
2.  **Cache Persistente em Banco:** Implementada a coluna `city_location` na tabela `fleet_current`. O backend consulta o banco antes de chamar a API externa. Resultados positivos são salvos para evitar chamadas duplicadas se o veículo não se moveu significativamente.
3.  **Resiliência no Cliente Geográfico:** O `ReverseGeocodingService` agora implementa tentativas (retries) com backoff exponencial (1.5s) e suporte a endereços rodoviários (fallbacks para o campo `road` quando a cidade não é retornada).

**Consequências:**
- **Prós:** Fim dos erros "Local Indeterminado" causados por limites de taxa; navegação na Escala de Fluxo muito mais rápida e leve.
- **Contras:** A localização inicial no modal pode demorar ~1-2s na primeira vez que um veículo é consultado.

---
*Documentado por @pm e validado por @mentor.*
