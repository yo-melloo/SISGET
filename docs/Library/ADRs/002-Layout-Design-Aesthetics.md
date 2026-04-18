# ADR 002: Layout, Centralização e Estética Funcional (Dry UI)

## Status
Aprovado (16/04/2026)

## Contexto
O SISGET WEB evoluiu de protótipos de alta fidelidade para uma interface operacional real. Durante o refinamento dos módulos de Garagem e Dashboards, surgiram decisões críticas sobre como equilibrar o visual "premium" (vibrante) com a carga cognitiva de usuários que operam o sistema sob pressão e por longas horas (plantão).

## Decisões Tomadas

### 1. Estética Funcional ("Dry UI")
Optamos por remover adornos visuais supérfluos, como:
- Brilhos externos (`glow`) em cards de tanques.
- Sombras projetadas vibrantes em barras de progresso.
- Efeitos de levitação (`translate-y`) excessivos.
**Justificativa:** Redução de fadiga visual e foco total na legibilidade dos dados técnicos (volumetria, prefixos, status).

### 2. Centralização de Conteúdo (`mx-auto`)
Todos os módulos autenticados foram configurados com um container de `max-w-[1400px]` e margens automáticas horizontais.
**Justificativa:** Melhora a experiência em monitores wide (ultra-wide), mantendo o conteúdo em uma área de foco central, evitando que o usuário precise girar o pescoço excessivamente.

### 3. Reserva para Módulo de Chat Lateral
A decisão de manter o `max-w-[1400px]` centralizado visa o futuro.
**Justificativa:** Permitir a inclusão de uma barra lateral direita exclusiva para o **Chat Operacional em Tempo Real**, sem sacrificar o layout atual dos módulos de tráfego.

### 4. Cores de Contraste no Tema Claro
Ajuste das variáveis de CSS para o tema claro:
- Fundo levemente acinzentado (`Slate 100`) para destacar cards brancos.
- Bordas mais escuras (`Slate 400`) para definição clara.
- Texto primário em `Slate 950`.
**Justificativa:** Responder ao feedback de "tema muito claro/lavado", garantindo contraste WCAG AA+ em ambientes com alta iluminação (escritório/rodoviária).

## Consequências
- A interface torna-se mais técnica e menos "artística", aproximando-se da familiaridade operacional.
- O código de estilo torna-se mais limpo e previsível.
- A expansão para o módulo de chat será feita injetando um novo container lateral na estrutura do layout.

---
**Links Relacionados:**
- [[000-PRD-SISGET]]
- [[Modulo-Notificacoes]]
