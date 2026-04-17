# ADR 001: Implementação de Runtime Portátil Local

## Status
Aceito (Temporário)

## Contexto
O projeto SISGET precisa de portabilidade total e facilidade de execução em diferentes máquinas Windows (incluindo máquinas secundárias de baixo desempenho). 
A solução padrão da indústria (Docker) não é viável neste momento devido a restrições de hardware no ambiente de operação secundário, que não suporta a virtualização necessária para o Docker Desktop.

## Decisão
Decidimos implementar uma estrutura de **Runtime Portátil** dentro do próprio repositório (diretório `runtime/`), contendo:
- **Node.js v20.12.2** (Binários Win x64)
- **OpenJDK 17 (Temurin)**
- **Python 3.11.9 (Embeddable)**

A lógica de execução no Frontend e Scripts de Setup priorizam estes binários. Caso não sejam encontrados, o sistema faz fallback para as variáveis de ambiente globais.

## Consequências
- **Prós**: Independência total de instalação no Windows; funciona em pendrives/HDs externos; resolve conflitos de versão entre máquinas.
- **Contras**: Aumenta o overhead de setup inicial (download dos binários); depende de scripts PowerShell para configuração de sessão.
- **Segurança**: Todos os diretórios de runtime estão explicitamente git-ignorados para evitar vazamento de binários ou configurações locais no repositório.

## Plano de Reversão / Futuro
Esta estrutura deve ser mantida enquanto houver necessidade de operação em hardware legado. Assim que houver disponibilidade de hardware compatível, a migração para **Docker/Dev Containers** é a recomendação principal para padronização.
