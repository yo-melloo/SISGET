# SISGET Frontend — Next.js

> Inicializar com TASK-002

## Setup previsto

- Next.js 14+
- CSS Vanilla (design system customizado)
- Tema dark com Glassmorphism
- Google Fonts (Inter/Outfit)

## Estrutura planejada

```
frontend/
├── src/
│   ├── app/             ← App Router (Next.js 14)
│   │   ├── (auth)/      ← Login
│   │   ├── dashboard/   ← Dashboard principal
│   │   ├── garagem/     ← Módulo Garagem (Reservas + Combustível)
│   │   ├── frota/       ← Módulo Frota (Posicionamento + Operação)
│   │   ├── escala/      ← Módulo Escala do Fluxo
│   │   └── pesquisa/    ← Módulo Consulta Rápida
│   ├── components/      ← Componentes reutilizáveis
│   ├── styles/          ← Design system (tokens, globais)
│   ├── lib/             ← Utilidades, API client
│   └── hooks/           ← Custom hooks
├── public/
├── package.json
└── next.config.js
```
