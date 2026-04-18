# Documento de Regras de Negócio — SISGET WEB

> **Versão:** 1.0  
> **Referência:** `000-PRD-SISGET.md` e `001-Especificação Técnica...`  
> **Status:** [PREENCHIDO]  
> **Autor:** @pm e Especialista de Negócio

---

## 1. Módulo de Autenticação e Gestão de Sessão

### 1.1 Regras de Login
- **RN01-01:** A senha padrão para os usuários é a sua própria matrícula. O usuário pode escolher mudá-la ou não.
- **RN01-02:** Caso mude a senha, a mesma é salva com hash Bcrypt no banco de dados
- **RN01-03:** Caso esqueça a senha, o sistema deve perguntar o email do usuário (e salvar ele) - se já tiver, ele envia uma nova senha temporária neste email -, se o usuário preferir não informar ou não tiver email, ele pode sinalizar para um administrador resetar a senha dele.
### 1.2 Níveis de Acesso (RBAC) - *Opcional*
- **RN01-03:** Administradores têm acesso total ao sistema com foco em gerenciamento de perfis, os Assistentes terão acesso ao sistema de forma íntegra e os motoristas serão os "guests" do sistema, com acesso apenas à escala do fluxo e ao futuro módulo de rastreamento.

---

## 2. Controle de Garagem

### 2.1 Reservas e Oficina (Carros e Pneus)

- **RN02-01:** O cadastro de nova reserva deve possuir campos obrigatórios: "Identificação", "Tipo" e "Status".
- **RN02-02:** O sistema deve armazenar o estado da reserva para um log detalhado dos eventos da garagem (exemplo: às 6am um carro estava em manutenção, e às 9 foi definido como disponível)

### 2.2 Gestão de Combustível (Tanques)
- **RN02-04:** A inserção de medição não pode ser uma medição negativa/menor que zero. Ela pode até ser maior que a capacidade dos tanques, por que físicamente os reservatórios podem expandir e contrair devido a temperatura, ocasionando em uma capacidade maior ou menor do que a real.
- **RN02-05:** A medição informada em cm deve seguir estritamente os resultados pré-definidos na tabela de medição, que tem como valor máximo 191cm (15.615L), essa tabela será digitalizada para o sistema em um segundo momento.

---

## 3. Controle de Frota

### 3.1 Posicionamento da Frota
- **RN03-01:** Um veículo só pode estar posicionado em uma base por vez, o sistema deve sinalizar repetições para os assistentes entenderem visualmente que aquilo é um erro.
- **RN03-02:** As tabelas do posicionamento de frota devem ter o número padrão de horários regulares para com cada base (linhas nas tabelas): 8 para Imperatriz, 4 para Belém, 6 para São Luís. 
- **RN03-03:** Os rodapés devem ser "mini-tabelas" onde os assistentes informam o número dos carros disponíveis, grade futura, e indisponíveis, ao ínves da informação resumida atual.

### 3.2 Operação da Frota (Diurna e Noturna)
- **RN03-04:** Carros e motoristas não podem aparecer repetidos numa mesma tabela.
- **RN03-05:** Estas tabelas interagirão com o bot-scraper para atualizar os dados de rastreamento dos carros, que serão alocados na tabela através da funcionalidade de atualização.
- **RN03-06:** O sistema contará com um algoritmo para calcular o tempo de chegada na base de Imperatriz baseado na fórmula de movimento uniforme, com adição dos tempos de parada para os pontos de parada dos esquemas operacionais de cada serviço.

---

## 4. Escala de Fluxo (Integração SharePoint)

### 4.1 Processamento de Planilha
- **RN04-01:** O sistema será alimentado por uma cópia em .xlsx da escala disponibilizada no SharePoint. Através de um script python, os dados da tabela serão convertidos em dados SQL e integrado aos registros do banco de dados. A API irá carregar/distribuir os dados no sistema baseado nesses registros salvos no banco, especialmente nos atuais (data de hoje). Chamo de dinâmica "Carregar e Atirar", Carregar: Realizar upload do arquivo da escala, realizar conversão de dados e inserir/atualizar no banco. Atirar: Aplicar e sincronizar alterações dos dados no sistema.
- **RN04-02:** O sistema deverá ser capaz de receber e atualizar o banco de dados independente de qual seja a data do registro carregado: Gustavo inseriu a escala do dia 3 repetidas vezes, o sistema apenas atualizou o dia 3 no banco de dados - se é que houve alguma mudança
- Nota do Desenvolvedor: Futuramente, ao se fundir com o Vitae, vamos ter que misturar essas tabelas de bancos de dados por serem parecidas e precisar de padronização, a escala vai ser a principal delas, a primeiro momento acredito que uma tabela simples resolva, mas quando estiver servindo para fazer escalas automatizadas, vamos precisar de índices, coisa que por enquanto não se faz necessário - até onde eu saiba.

---

## 5. Regras de Dados, Consulta e Outros

### 5.1 Restrições de Bancos / Padrões de Pesquisa
- **RN05-01:** Os padrões de pesquisa devem ignorar hífens para pesquisar placas de maneiras diferentes, pensando justamente no fluxo copia e cola de diferentes fontes que podem citar as placas dos veículos de diferentes formas
- **RN05-02:** Preparar o banco de dados para evitar Problema N+1

---

> **Critérios de Validação pelo Arquiteto de Segurança (@pm / @redteam):** 
> 1. Validar se não se criam loops de dados (ex: Motorista operando 48h sem checagem). - Deixar isso para o Sistema Vitae
> 2. Validar se inserção de combustível possui travas de sanity check para não desestabilizar sistema por erro de digitação. - É uma boa!
