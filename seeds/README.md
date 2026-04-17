# README — Seeds do SISGET WEB

Dados iniciais extraídos da planilha `SISGET - SISTEMA DE GERENCIAMENTO DE TRÁFEGO.xlsx` para seeding do banco de dados da aplicação web.

## Arquivos

| Arquivo | Registros | Fonte (aba da planilha) | Módulo |
|---------|-----------|------------------------|--------|
| `motoristas.json` | 604 | BANCO DE DADOS (oculta) | Cadastro |
| `frota.json` | 170 | BANCO DE DADOS (oculta) | Cadastro |
| `ravs.json` | 85 | CONTROLE DE RAVs (oculta) | Backlog — módulo futuro |
| `reservas.json` | 5 | RESERVAS E QUARTOS | Garagem / Oficina |

## Como usar

Os arquivos JSON podem ser importados diretamente no banco de dados via script de seeding no backend (Spring Boot).

```java
// Exemplo de uso com Spring Boot
@PostConstruct
public void seedDatabase() {
    // Carregar motoristas.json e persistir no banco
}
```

## Regenerar Seeds

Para atualizar os seeds a partir de uma versão mais recente da planilha:

```powershell
python seeds/extract_seeds.py
```

## Extração

Gerado por `extract_seeds.py` em 15/04/2026.
