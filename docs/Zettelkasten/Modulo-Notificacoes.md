# Módulo: Central de Notificações

O módulo de notificações do SISGET WEB atua como o sistema nervoso central do plantão, alertando sobre eventos críticos que ocorrem em tempo real nos outros módulos.

## Arquitetura
- **Componente:** `Notifications.tsx` (posicionado no Navbar).
- **Acessibilidade:** Dropdown opaco (100% background) para evitar sobreposição ilegível.
- **Tipos de Alerta:**
  - `GARAGE`: Críticos de combustível ou movimentação de ativos.
  - `INFO`: Escalas, calendários e atualizações do SharePoint.
  - `SUCCESS`: Conclusão de manutenções ou fluxos validados.

## Regras de Interface
- O contador de não-lidas deve persistir visualmente no `BellIcon`.
- O histórico de notificações deve ser limpo pelo usuário (`TrashIcon`) ou via "Marcar todas como lidas".
- O painel sobrepõe o conteúdo central com uma sombra profunda para foco total.

## Integrações Futuras
- **WebSockets:** Implementar para que alertas de tanques (vazão/consumo) apareçam instantaneamente para todos os auxiliares logados.
<<<<<<< HEAD:docs/Zettelkasten/Modulo-Notificacoes.md
- **Push API:** Avaliar para alertas críticos de segurança (RAVs) mesmo com aba fechada.
=======
>>>>>>> 31b01da (feat: centralize Satélite Norte project and SISGET into root repository):Satélite Norte/docs/Zettelkasten/Modulo-Notificacoes.md

---
**Tags:** #UX #UI #Notifications #AlertSystem
**Relacionado:** [[ADR-002-Layout-Design-Aesthetics]]
