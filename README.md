# SISGET WEB — Código da Aplicação

Sistema de Gerenciamento de Tráfego — Filial Satélite Norte (Imperatriz/MA).

## Estrutura

```
sisget/
├── backend/          ← Java (Spring Boot) — API REST
│   └── (inicializado na TASK-001)
├── frontend/         ← Next.js — Interface web
│   └── (inicializado na TASK-002)
└── README.md         ← Este arquivo
```

## Stack

| Camada | Tecnologia | Fase |
|--------|------------|------|
| Back-end | Java 17+ / Spring Boot | Beta 1 |
| Front-end | Next.js / CSS Vanilla | Beta 1 |
| Banco de Dados | SQLite (dev) → PostgreSQL (prod) | Beta 1 → Beta 2 |
| Deploy | Local → VPS/Nuvem | Beta 2 |

## Referências

- Documentação: `../docs/`
- Seeds (dados iniciais): `../seeds/`
- Agentes de IA: `../.agents/`
