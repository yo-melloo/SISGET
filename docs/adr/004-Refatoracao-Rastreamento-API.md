# ADR 004: Refatoração do Rastreamento para Arquitetura Baseada em API

## Status
Proposto

## Contexto
O sistema de rastreamento atual utiliza um bot Playwright que gera um arquivo `fleet_data.js` no sistema de arquivos. O frontend Next.js lê este arquivo diretamente.
Problemas identificados:
- **Acoplamento Físico**: Frontend e Bot precisam estar no mesmo servidor/disco.
- **Segurança**: Risco de RCE via `exec` no Next.js e exposição de arquivos sensíveis.
- **Escalabilidade**: Dificuldade em manter histórico de posições e telemetria.

## Decisões

### 1. Comunicação via API REST
O bot deixará de salvar arquivos locais. Ao finalizar o scraping, ele enviará um payload JSON via HTTP POST para o backend Spring Boot.

### 2. Separação de Dados (Estado vs. Histórico)
Para otimizar o banco de dados:
- **Tabela `fleet_current`**: Armazena apenas o último status conhecido de cada veículo (Prefixo é a PK). Tamanho fixo (aprox. 170 registros).
- **Tabela `fleet_history`**: Armazena logs de movimentação e mudanças de estado para análise futura.

### 3. Automação e Ciclo de Vida do Bot
- O bot terá um parâmetro `--loop` e um intervalo de execução entre **90 e 120 segundos** (alinhado com a atualização do LifeWeb).
- Implementação de um "Toggle" (Ligar/Desligar) para evitar consumo excessivo de recursos e bloqueios em servidores de terceiros.

### 4. Blindagem de Segurança (@redteam)
- **Zero Trust Frontend**: O frontend nunca terá permissão de escrita direta nos dados de frota.
- **Autenticação Bot -> Backend**: Uso de uma `INTERNAL_API_KEY` trafegada no Header para validar que apenas o bot legítimo atualiza as posições.
- **Validação Rigorosa**: O backend validará o schema do JSON recebido antes de persistir.

## Consequências
- **Positivas**: Maior segurança, independência de processos, capacidade de histórico.
- **Negativas**: Pequeno overhead de latência no POST (insignificante para o intervalo de 90s).

## Feedback do Usuário
- O bot deve ser cauteloso para não gerar requisições infinitas por erro de lógica.
- O sistema não reflete "tempo real" absoluto, mas sim "estado periódico".
