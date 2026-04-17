# SISGET Backend — Spring Boot

> Inicializar com TASK-001

## Setup previsto

- Java 17+
- Spring Boot 3.x
- SQLite (JPA/Hibernate)
- JWT para autenticação

## Estrutura planejada

```
backend/
├── src/main/java/com/satelitenorte/sisget/
│   ├── config/          ← Configurações (Security, CORS, etc.)
│   ├── controller/      ← REST Controllers
│   ├── model/           ← Entidades JPA
│   ├── repository/      ← Spring Data Repositories
│   ├── service/         ← Lógica de negócio
│   ├── dto/             ← Data Transfer Objects
│   └── seed/            ← Seeders (importação de /seeds/)
├── src/main/resources/
│   ├── application.yml
│   └── application-dev.yml
├── src/test/
├── pom.xml
└── .env.example
```
