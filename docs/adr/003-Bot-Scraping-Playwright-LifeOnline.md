# ADR-003 — Bot de Scraping Playwright (Life Online)

> **Status:** ✅ Aceito  
> **Data:** 16/04/2026  
> **Autores:** Gustavo Mello  
> **Módulo:** Automação / Rastreamento  

---

## Contexto

O sistema de rastreamento da Satélite Norte é gerenciado pela plataforma **Life Online** (`lifeonline.com.br/sistemas_v2/index.php`) — sistema terceiro, sem API pública documentada. Para exibir a localização atual dos veículos no módulo **LOC. ATUAL** do SISGET, é necessário coletar os dados de posicionamento em tempo real.

A frota monitorada possui **167 veículos** distribuídos em três bases (Imperatriz, São Luís, Belém).

---

## Decisão

Implementar um **bot Python com Playwright** (`sisget/bot/scrape_bot.py`) que:

1. Autentica no sistema Life Online com credenciais configuradas no `.env`.
2. Navega até a seção **Acompanhamento → Rastreamento → Online**.
3. Intercepta a resposta AJAX de `314 KB` que contém os dados completos de rastreamento de toda a frota.
4. Persiste o resultado em `sisget/bot/fleet_status.json`.

---

## Alternativas Consideradas

| Alternativa | Motivo da Rejeição |
|---|---|
| API REST pública do Life Online | Não existe. O sistema é um mono-index PHP com AJAX puro. |
| Automação via `requests` + cookies | O sistema depende de JS para renderizar o mapa e disparar o AJAX correto. `requests` não executa JS. |
| Acesso via RPA desktop (PyAutoGUI) | Frágil, lento e não headless. Incompatível com execução em servidor. |
| Integração direta com GPS dos veículos | Fora do escopo — hardware pertence à Life Online. |

---

## Problema Técnico Resolvido: Double-Encoded JSON

O endpoint `/index.php` retorna os dados de toda a frota em dois payloads distintos:

| Tamanho | Conteúdo | Veículos |
|---|---|---|
| ~7 KB | Veículos offline/manutenção, sem GPS | 20* |
| **~314 KB** | **Toda a frota com coordenadas GPS** | **167** |

O payload de 314 KB chega com cada `"` escapado como `\"`, tornando o body **inválido para `json.loads()` direto**. A função `try_parse_fleet()` implementa um decoder de 3 camadas:

```python
# Camada 1: parse direto (JSON limpo)
data = json.loads(body)

# Camada 2: string JSON dentro de JSON (double-encoded)
if isinstance(data, str):
    inner = json.loads(data)

# Camada 3: backslash-escaped quotes progressivo (formato real do 314KB)
candidate = body
for step in range(3):
    candidate = candidate.replace('\\"', '"')
    data = json.loads(candidate)
```

---

## Estratégia de Captura

O bot utiliza duas heurísticas de qualidade para decidir qual payload aceitar:

1. **Prioridade GPS:** payload com `RASTLATITUDE` é preferido sobre um sem GPS.
2. **Maior wins:** se dois payloads passarem no filtro, vence o com mais veículos.
3. **Fallback DOM:** se nenhum payload for capturado pela rede, tenta extrair `dsVeiculos` via `page.evaluate()` do objeto JS `Life.RastreamentoOnline`.

---

## Estrutura de Dados Capturada (`fleet_status.json`)

Cada veículo retorna **68 campos**. Campos relevantes para o SISGET:

| Campo | Descrição |
|---|---|
| `VEICCODIGO` | Prefixo do veículo |
| `VEICNOME` | Nome/descrição do veículo |
| `VEICPLACA` | Placa |
| `RASTLATITUDE` / `RASTLONGITUDE` | Coordenadas GPS (string vazia se sem sinal) |
| `RASTVELOCIDADE` | Velocidade atual (km/h) |
| `RASTDATA` | Timestamp da última coleta |
| `STATUS` | `online`, `offline`, `offline-monitriip`, etc. |
| `APESTNOME` | Status de parada (Aberto / Fechado) |
| `FUNCNOME` | Nome do motorista atual |
| `FUNCMATRICULA` | Matrícula do motorista |
| `DIFFRAST` | Tempo desde a última transmissão (horas) |

---

## Consequências

### Positivas
- Coleta completa da frota (167/167 veículos) em uma única execução.
- Independente de API privada — roda sobre o browser real (evasão de fingerprinting básika).
- Headless — pode ser executado como serviço agendado (cron / scheduler Spring).

### Negativas / Riscos
- **Fragilidade de seletores:** se o Life Online mudar o ID `#ar-online` ou o layout de menu, o bot quebra.
- **Tempo de execução:** ~35s por ciclo (20s de wait do Playwright + overhead do browser).
- **Não é uma API**: mudanças na estrutura do payload exigem atualização do decoder.
- **Credenciais em `.env`:** risco se o arquivo vazar — mitigado por `.gitignore`.

### Avisos IDE (não-bloqueantes)
O aviso `Cannot find module playwright.async_api` é exibido pelo linter quando o interpretador configurado no IDE é o Python do sistema (`Python314`), não o `.venv`. O bot **roda corretamente** via `.venv\Scripts\python.exe`. Solução: configurar o workspace para usar `.venv` como intérprete padrão.

---

## Critério de Conclusão (Definition of Done)

- [x] Bot autentica com sucesso no Life Online
- [x] Bot navega para a seção de rastreamento online
- [x] Bot captura os dados de **167 veículos** (frota completa)
- [x] `fleet_status.json` gerado com **68 campos por veículo**, incluindo GPS
- [x] Credenciais exclusivamente no `.env` (fora do VCS)
- [x] `.env.example` disponível no repositório

---

## Referências

- `sisget/bot/scrape_bot.py` — implementação principal
- `sisget/bot/login_bot.py` — PoC de login (descontinuado, mantido como referência)
- `sisget/bot/network_log.json` — log de rede capturado durante análise
- `sisget/bot/requirements.txt` — dependências Python do bot
- `docs/000-PRD-SISGET.md` — seção 7 (Arquitetura, linha Automação)
