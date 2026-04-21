# Feature: Módulo de Anotações Operacionais (Card Outros)

## 🎯 Objetivo
Transformar o card "OUTROS" em um sistema dinâmico de persistência de informações que não se encaixam em Ocorrências, Pneus ou Carros Reserva.

## 🛠️ Especificação Técnica Preliminar
- **Contexto:** As anotações devem ser vinculadas à `data_escala` e ao `turno` (opcionalmente) ou apenas global ao dia operativo.
- **Entidade Backend:** Criar `FleetNote` (id, data, autor, texto, timestamp).
- **Frontend:**
  - O card "OUTROS" deve renderizar a lista de anotações atuais.
  - Implementar um modal de edição (CRUD) acessível por um botão `Plus` no header do card.
  - Suporte a Markdown básico ou texto simples.

## 🔗 Relações
- [[001-Especificação Técnica - Sistema de Gerenciamento de Tráfego (SISGET WEB)]]
- [[008-Unified-Operational-Dashboard]]
- MOC: [[MOC-Tracking]]

## 📅 Próximos Passos (Pipeline SDD)
1. **@pm / @redteam:** Modelagem de ameaças (Ex: Injeção de script nas notas).
2. **@engineer:** Criação do repositório/service no backend.
3. **@qa:** Teste de persistência e deleção.
