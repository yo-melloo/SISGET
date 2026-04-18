# ADR 005: Plano de Evolução para Segurança com TLS Interno (mTLS)

## Status
Proposto

## Contexto
Atualmente, a comunicação entre o `scrape_bot.py` (Python) e o backend SISGET (Spring Boot) ocorre via protocolo HTTP plano utilizando um cabeçalho de autenticação `X-Internal-Key`.
Embora ambos residam no mesmo ambiente de execução (VPS/Localhost), a interceptação de tráfego local ou a exposição acidental de portas internas pode comprometer o segredo compartilhado.

## Decisão de Evolução Futura

### 1. Implementação de TLS (HTTPS)
O backend Spring Boot deve ser configurado para utilizar SSL/TLS, fornecendo uma camada de criptografia na camada de transporte.
- **Ação**: Gerar um auto-certificado (self-signed) ou usar um certificado via ZeroSSL/Let's Encrypt para o domínio interno.

### 2. Autenticação Mútua (mTLS)
Para garantir que **apenas** o Bot legítimo consiga realizar o `POST /update-batch`, evoluiremos para mTLS.
- **Backend**: Exigirá um certificado de cliente válido.
- **Bot**: Portará um certificado privado e uma chave para se autenticar no handshake.

### 3. Blindagem de Rede
- Configurar o Firewall (UFW/Iptables) para que a porta do backend destinada a patches de frota aceite conexões de entrada exclusivamente de IPs autorizados ou apenas via interface de loopback (`127.0.0.1`).

## Consequências
- **Segurança**: Proteção contra ataques de Man-in-the-Middle (MitM) internos e spoofing de frota.
- **Complexidade**: Aumenta a necessidade de gestão de segredos e certificados (renovação).

## Roteiro de Implementação
1. Configurar `server.ssl` no `application.properties` do Spring.
2. Atualizar o `httpx.AsyncClient` no Python para carregar o `ssl_context` com o certificado CA.
