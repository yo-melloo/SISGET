# ADR 004: Sincronização de Regras de Negócio e Expansão de Escopo (Beta 1)

## Status
Proposta

## Contexto
Após um detalhamento profundo das rotinas operacionais em `Regras de Negócio Satélite Norte.md`, identificamos a necessidade de alinhar o PRD e o Backlog de Tasks com a realidade física da garagem. As premissas iniciais sobre restrições de acesso por hierarquia e o adiamento do módulo RAV foram revistas para melhor refletir as dores reais do usuário.

## Decisões
1. **Expansão do Escopo (Beta 1):** O módulo **RAV (Relatório de Avaria e Sinistro)** foi promovido de backlog futuro para funcionalidade fundamental da Beta 1 devido à fragilidade crítica das planilhas Excel atuais.
2. **Modelo de Acesso Irrestrito:** Apesar da hierarquia administrativa, o software não implementará barreiras de acesso por cargo. Todos os cargos terão acesso total a todos os módulos para garantir a fluidez do plantão.
3. **Desacoplamento de Escalas:** A **Escala do Fluxo de Frota** (foco atual) foi explicitamente separada da **Escala de Motoristas** (futuro). O sistema não implementará validações de RH (descanso 11h/folga 6+1) na Escala de Fluxo nesta fase.
4. **Módulo de Combustível Unificado:** As ações de "Medição" e "Descarregamento" serão processadas sob o mesmo módulo/tabela, mas como ações distintas para auditoria de Nota Fiscal.
5. **Georeferenciamento Estratégico:** Adoção de **Leaflet Geofencing** para mitigar falhas de hardware no rastreamento nas bases de Belém e São Luís.

## Consequências
- **Positivas:** Alinhamento total com as dores operacionais; maior segurança jurídica através do dossiê RAV imutável; redução de carga cognitiva do assistente ao não impor bloqueios de software desnecessários.
- **Negativas:** Adição de complexidade na Beta 1 (RAV e Geofencing).
- **Riscos:** O prazo da Beta 1 (15/05) torna-se mais desafiador com a inclusão do RAV.

## Referências
- `Regras de Negócio Satélite Norte.md`
- `000-PRD-SISGET.md (v1.1)`
- `003-Tasks - SISGET WEB.md`
