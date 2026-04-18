# Documentação de Implementação: Dashboard de Ocorrências (SISGET)

## 1. Objetivo
Criar uma interface de monitoramento em tempo real para a frota da Satélite Norte, permitindo que operadores registrem e visualizem ocorrências técnicas ou operacionais vinculadas a veículos específicos diretamente no mapa.

## 2. Funcionalidades Implementadas (MVP)
- **Integração Leaflet:** Visualização geográfica da frota consumindo dados de telemetria (JSON/JS).
- **Correção Geográfica:** Tratamento de coordenadas para garantir o posicionamento correto no hemisfério Sul/Oeste (Brasil).
- **Gestão de Notas:** Sistema de persistência local (LocalStorage) para registro de ocorrências.
- **Destaque Visual:** Marcadores dinâmicos que mudam de cor e tamanho para indicar veículos com ocorrências ativas (Alerta Laranja).

## 3. Arquitetura Proposta para Futuro
- **Backend:** Evoluir do LocalStorage para um banco de dados (PostgreSQL/MongoDB) para compartilhamento de notas entre múltiplos usuários.
- **Autenticação:** Sistema de login para identificar quem registrou cada ocorrência.
- **Histórico:** Log de alterações para manter o rastro de manutenções passadas de cada prefixo.

## 4. Exemplo de Uso
- **Input:** "20016 - Retentor furado, manutenção de IMP irá avaliar"
- **Ação:** O operador seleciona o prefixo 20016, insere o relato e o sistema marca o veículo com um alerta persistente no mapa.

---
*Gerado automaticamente em 16 de Abril de 2026 pelo Gemini CLI.*
