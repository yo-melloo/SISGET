# Rewind: Integração Meteorológica & UI Refinement (2026-04-21)

## Contexto
O sistema exigia uma visualização meteorológica robusta para o rastreamento e um resumo operacional mais rico na dashboard, além de melhorias de acessibilidade.

## Decisões Técnicas

### 1. Migração para OpenWeatherMap (OWM)
- **Motivo:** O serviço NASA GIBS estava limitado ao nível de zoom 7 e apresentava erros 400 frequentes.
- **Solução:** Implementação de `OpenWeatherMapLayer` utilizando o endpoint de tiles `clouds_new` e `precipitation_new`.
- **Governança de Cota:** Implementado `updateWhenIdle` e um temporizador cíclico de 120s com feedback visual (Progress Ring) para proteger o limite de 60 calls/min do plano gratuito.

### 2. Dashboard Inteligente
- **Funcionalidade:** O card de clima agora permite expansão via `WeatherModal`.
- **Dados:** Integração de Umidade Relativa e Velocidade do Vento via backend (Open-Meteo).
- **UX:** Remoção de animações intrusivas após o carregamento dos dados.

### 3. Navbar Evolution
- **Componente:** `Clock.tsx` adicionado para monitoramento de fuso operacional.
- **Design:** Cores dinâmicas baseadas no período do dia (Madrugada, Manhã, Tarde, Noite) com alto contraste para acessibilidade.

## Impacto na Infraestrutura
- **Backend:** Atualização do `WeatherResponseDTO` e `WeatherService` para suportar novas métricas sem ônus financeiro (usando Open-Meteo).
- **Frontend:** Redução de dívida técnica com a remoção de `NasaSatelliteLayer` e `RainViewerLayer`.

## Status Final
- [x] Integração OWM funcional com suporte a zoom.
- [x] Proteção de cota por timer visual.
- [x] Detalhes de clima na Dashboard.
- [x] Relógio cromático na Navbar.
