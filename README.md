# 🛰️ SISGET - Sistema de Gerenciamento de Tráfego

Repositório oficial da evolução Web do sistema SISGET para a Satélite Norte. Uma aplicação Full-Stack modular projetada para performance, portabilidade e automação de coleta de dados de frota.

## 🚀 Diferenciais Técnicos

- **Bot Scraper High-Performance**: Coleta de dados via HTTP Request direta (Python), reduzindo o tempo de processamento de ~15s para **< 1 segundo**.
- **Infraestrutura Portátil**: Ambiente de execução (Node.js, Java, Python) configurado de forma isolada em pastas locais, permitindo rodar em máquinas sem privilégios de administrador.
- **Arquitetura Desacoplada**: Separação clara entre Backend (Spring Boot), Frontend (Next.js) e Automação (Python).

## 📂 Estrutura do Projeto

```bash
sisget/
├── backend/    # API REST em Java (Spring Boot)
├── frontend/   # Interface Web em Next.js (React)
├── bot/        # Scraper otimizado para LifeOnline (Python)
├── docs/       # Documentação Técnica e ADRs (Decisões de Arquitetura)
├── scripts/    # Automação de ambiente e ativação portátil
└── seeds/      # Scripts de extração de dados das planilhas Excel
```

## 🛠️ Setup Rápido (Ambiente Portátil)

Siga estes passos se estiver em uma máquina nova ou sem as dependências instaladas:

1. **Instalar Runtimes**: 
   ```powershell
   cd scripts
   ./setup-runtime.ps1
   ```
2. **Ativar Ambiente na Sessão**:
   ```powershell
   . ./scripts/activate-env.ps1
   ```
3. **Extrair Dados (Opcional)**:
   ```powershell
   python seeds/extract_seeds.py
   ```

## 📄 Documentação

Consulte a pasta `docs/` para detalhes sobre:
- [PRD - Requisitos do Produto](docs/000-PRD-SISGET.md)
- [ADR 001 - Runtime Portátil](docs/adr/001-portable-runtime.md)

---
**Desenvolvimento:** [yo-melloo](https://github.com/yo-melloo) | **Status:** Beta 1
