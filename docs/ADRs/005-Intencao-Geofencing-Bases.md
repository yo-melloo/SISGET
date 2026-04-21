# ADR 005: Intenção de Geofencing para Monitoramento de Bases

## Status
Proposto (Adiado em favor de Clima Contextual)

## Contexto
O SISGET opera principalmente em 3 bases (Imperatriz, São Luís e Belém). Durante a integração de clima, surgiu a necessidade de monitorar estas bases de forma proativa. O usuário deseja que o sistema saiba quando um veículo entra ou sai dessas áreas para disparar lógicas de negócio específicas (alertas de atraso, condições de pista, etc).

## Decisão
A implementação de marcadores fixos de clima para as bases foi descartada nesta etapa. Em vez disso, optou-se por focar no clima em tempo real na coordendada exata de cada veículo.

A funcionalidade de **Geofencing** será implementada em uma tarefa futura, utilizando perímetros circulares (Radius) ou polígonos sobre as coordenadas das garagens.

## Consequências
- A lógica de monitorar o clima das bases será automatizada via servidor (backend) em vez de ser puramente visual no frontend.
- O frontend se manterá focado no posicionamento dinâmico da frota.
- Necessidade futura de uma tabela `BaseGaragem` com `Latitude`, `Longitude` e `RaioAlerta`.
