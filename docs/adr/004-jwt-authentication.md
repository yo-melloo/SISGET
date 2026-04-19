# ADR 004: Autenticação Baseada em JWT (Identity)

## Status
Aceito

## Contexto
O SISGET necessitava de um mecanismo de autenticação seguro para proteger os endpoints da API e identificar os usuários (motoristas e administradores). A solução anterior utilizava apenas chaves de API internas fixas, o que não permitia rastreabilidade por usuário ou expiração de sessões.

## Decisão
Implementamos a autenticação via JSON Web Tokens (JWT) integrada com Spring Security 6.2.

- **Filtro de Segurança**: `JwtAuthenticationFilter` intercepta cada requisição, valida o token no header `Authorization` e popula o `SecurityContextHolder`.
- **Stateless**: A política de sessão é definida como `STATELESS` (sem persistência de sessão no servidor).
- **UserDetails**: A entidade `Usuario` implementa a interface `UserDetails` do Spring Security para integração direta com os mecanismos de autenticação.
- **Armazenamento de Senha**: Utilização de `BCryptPasswordEncoder` para hash de senhas.
- **Gestão de Token**: `JwtService` centraliza a lógica de geração (expiração de 1 hora) e extração de claims.

## Consequências
- **Positivas**:
  - Escalabilidade horizontal devido à natureza stateless.
  - Maior segurança e controle de acesso granular por usuário.
  - Integração simplificada com o frontend Next.js.
- **Negativas/Riscos**:
  - Necessidade de gerenciar a expiração e renovação (refresh) de tokens no frontend futuramente.
  - Risco se a Secret Key for comprometida (deve ser rotacionada e protegida por variáveis de ambiente).

## Vetores de Ataque Analisados (@redteam)
- **Token Leakage**: Protegido pelo uso de HTTPS e armazenamento seguro (localStorage em MVP, mas recomendado cookies HttpOnly em produção).
- **Brute Force**: Mitigado pela complexidade do BCrypt (cost factor 10).
- **JWT Alg Injection**: Mitigado pelo uso de bibliotecas modernas (JJWT) que validam a assinatura de forma rigorosa.
