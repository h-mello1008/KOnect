# Plano de Testes - KOnect

## 1. Funcionalidades a serem testadas

Funcionalidades agrupadas por módulo, com base nos endpoints PHP e telas existentes no projeto.

### 1.1 Autenticação e Sessão
- Login de usuário (`usuario_login.php`) — Admin, Instrutor e Aluno
- Validação de sessão ativa (`valida_sessao.php`)
- Logoff / expiração de sessão
- Bloqueio de acesso a páginas restritas sem sessão válida

### 1.2 Módulo Admin
- Cadastrar, listar, alterar e excluir Admin
- Cadastrar aluno via painel admin (`aluno_novo_admin.php`)
- Listar academias ativas
- Listar e atualizar instrutores (`instrutor_get.php`, `instrutor_update.php`)
- Relatórios administrativos e fluxo de caixa

### 1.3 Módulo Academia
- Cadastrar nova academia
- Listar academia(s)
- Alterar dados da academia
- Excluir academia

### 1.4 Módulo Instrutor
- Cadastro de instrutor
- Login do instrutor
- Gestão de alunos (listar, alterar, excluir/deletar)
- Progresso de faixa do aluno (`aluno_progresso_faixa.php`)
- Gestão de agenda de aulas (criar, listar, alterar, excluir)
- Gestão de avisos (criar, listar, alterar, excluir)
- Consulta de academias vinculadas
- Registro de pagamentos / fluxo de caixa

### 1.5 Módulo Aluno
- Cadastro de aluno
- Alteração e exclusão de cadastro
- Vínculo do aluno a uma academia
- Check-in em aula (`aluno_checkin.php`)
- Consulta de agenda de aulas
- Histórico de aulas frequentadas
- Consulta de avisos
- Consulta de mensalidades pendentes/vencidas (`mensalidade_get.php`)
- Pagamento de mensalidade (`mensalidade_pagar.php`)
- Histórico de mensalidades pagas (`mensalidade_historico_pago.php`)

### 1.6 Módulo Graduação
- Cadastrar, listar, alterar e excluir regras de graduação/faixa

### 1.7 Módulo Mensalidade / Financeiro
- Cálculo de dias em atraso / dias para vencer (`dias_vencimento`)
- Classificação automática de status: Pendente, Vencido, Pago
- Consolidado de totais (vencido, pendente, geral)
- Fluxo de caixa da academia (`mensalidade_fluxo_caixa.php`)

### 1.8 Módulo Modalidade
- Listagem de modalidades/esportes oferecidos

### 1.9 Conexão e infraestrutura
- Conexão com banco de dados MySQL (`conexao.php`)
- Padrão de retorno JSON (`status`, `mensagem`, `data`) em todos os endpoints

---

## 2. Tipos de testes a serem realizados

### 2.1 Teste Unitário (Caixa Branca)
Analisa a lógica interna do código, célula por célula, verificando os caminhos e condições internas de cada função — conteúdo que veremos na próxima aula.

Candidatos prioritários no KOnect (funções com regras de negócio isoladas e fáceis de testar unitariamente):
- Cálculo de `dias_vencimento` em `mensalidade_get.php` (casos limite: vence hoje, 1 dia vencido, 1 dia para vencer)
- Definição do `status_pagamento` (Pendente / Vencido / Pago) a partir da data de vencimento e data de pagamento
- Validação de campos obrigatórios antes de inserir no banco (ex.: `aluno_novo.php`, `academia_novo.php`)
- Regras de graduação/faixa (`graduacao_regra_*.php`)
- Formatação do padrão de retorno JSON (`status`, `mensagem`, `data`)

### 2.2 Teste Funcional (Caixa Preta)
Testa cada endpoint a partir das entradas e saídas, sem olhar o código interno — apenas verificando se o resultado (JSON de retorno) está correto para entradas válidas e inválidas.
- Ex.: enviar `POST /php/aluno/aluno_novo.php` sem campo obrigatório → esperar `status: "nok"`
- Ex.: login com credenciais corretas/incorretas → esperar `status: "ok"`/`"nok"`

### 2.3 Teste de Integração
Verifica se os módulos PHP se comunicam corretamente com o banco de dados MySQL e entre si (ex.: matrícula → mensalidade → fluxo de caixa).

### 2.4 Teste de Sistema (Ponta a Ponta)
Valida fluxos completos do usuário através da interface, simulando o uso real:
- Aluno faz login → visualiza agenda → faz check-in → consulta mensalidades → paga mensalidade
- Instrutor faz login → cadastra aluno → cria turma/agenda → lança aviso

### 2.5 Teste de Regressão
Reexecução dos testes existentes após qualquer alteração de código, para garantir que funcionalidades já validadas continuam funcionando.

### 2.6 Teste de Usabilidade
Avaliação das telas (`pages/admin`, `pages/aluno`, `pages/instrutor`) quanto à clareza, navegação e feedback ao usuário (mensagens de erro/sucesso, responsividade).

### 2.7 Teste de Segurança
- Verificar proteção contra SQL Injection (o projeto já utiliza Prepared Statements)
- Verificar armazenamento de senha em texto simples — ponto de risco já identificado na documentação, candidato a teste e correção (uso de `password_hash`/`password_verify`)
- Testar acesso a endpoints protegidos sem sessão válida

---

## 3. Observações

- Atualmente o projeto não possui testes automatizados implementados (item pendente listado em `API_DOCUMENTATION.md`).
- Este plano cobre tanto caixa branca (unitário, foco na lógica interna) quanto caixa preta (funcional/sistema, foco no comportamento externo), conforme solicitado.

---

## 4. Casos de Teste

### 4.1 Casos de Teste — Caixa Preta (Funcional)

Testam entradas e saídas de cada funcionalidade, sem considerar a implementação interna.

| ID | Módulo | Caso de Teste | Dados de Entrada | Resultado Esperado |
|----|--------|----------------|-------------------|---------------------|
| CP01 | Autenticação | Login com credenciais válidas | Email e senha corretos de um aluno cadastrado | `status: "ok"`, dados da sessão/usuário retornados |
| CP02 | Autenticação | Login com senha incorreta | Email válido + senha errada | `status: "nok"`, mensagem de erro, sessão não criada |
| CP03 | Autenticação | Login com email inexistente | Email não cadastrado | `status: "nok"`, mensagem "usuário não encontrado" |
| CP04 | Autenticação | Login com campos vazios | Email e senha em branco | `status: "nok"`, mensagem de campo obrigatório |
| CP05 | Autenticação | Validar sessão ativa | Sessão previamente autenticada | Retorna dados do usuário logado |
| CP06 | Autenticação | Acessar endpoint protegido sem login | Requisição sem sessão ativa | `status: "nok"` / acesso negado |
| CP07 | Autenticação | Logoff | Sessão ativa + chamada de logoff | Sessão encerrada; acesso posterior é negado |
| CP08 | Aluno | Cadastrar aluno com dados válidos | Nome, email, senha, dados obrigatórios preenchidos | `status: "ok"`, aluno criado no banco |
| CP09 | Aluno | Cadastrar aluno sem nome | Campo `nome` vazio | `status: "nok"`, mensagem de campo obrigatório |
| CP10 | Aluno | Cadastrar aluno com email já existente | Email duplicado de outro usuário | `status: "nok"`, mensagem de e-mail já cadastrado |
| CP11 | Aluno | Alterar dados de aluno existente | ID válido + novos dados | `status: "ok"`, dados atualizados |
| CP12 | Aluno | Alterar aluno com ID inexistente | ID inválido/inexistente | `status: "nok"`, mensagem de aluno não encontrado |
| CP13 | Aluno | Excluir aluno existente | ID válido | `status: "ok"`, aluno removido |
| CP14 | Aluno | Excluir aluno com ID inexistente | ID inválido | `status: "nok"` |
| CP15 | Aluno | Vincular aluno a uma academia | ID de aluno e academia válidos | `status: "ok"`, vínculo criado |
| CP16 | Aluno | Check-in em aula válida | Aluno matriculado + aula do dia | `status: "ok"`, frequência registrada |
| CP17 | Aluno | Check-in duplicado na mesma aula | Segundo check-in na mesma aula/dia | `status: "nok"`, impede duplicidade |
| CP18 | Aluno | Consultar agenda de aulas | Aluno autenticado | Lista de aulas da(s) turma(s) do aluno |
| CP19 | Aluno | Consultar histórico de aulas | Aluno com frequências registradas | Lista de aulas já frequentadas |
| CP20 | Aluno | Consultar avisos do aluno | Aluno vinculado a uma academia com avisos ativos | Lista de avisos correspondentes |
| CP21 | Mensalidade | Consultar mensalidades pendentes/vencidas | Aluno com mensalidades cadastradas | Lista com `status_display` e `dias_vencimento` corretos |
| CP22 | Mensalidade | Pagar mensalidade pendente | Mensalidade com `status_pagamento = "Pendente"` | `status: "ok"`, status alterado para "Pago" |
| CP23 | Mensalidade | Pagar mensalidade já paga | Mensalidade com `status_pagamento = "Pago"` | `status: "nok"`, impede pagamento duplicado |
| CP24 | Mensalidade | Consultar histórico de mensalidades pagas | Aluno com pagamentos anteriores | Lista de mensalidades com status "Pago" |
| CP25 | Academia | Cadastrar academia com dados válidos | Nome, endereço e demais campos preenchidos | `status: "ok"`, academia criada |
| CP26 | Academia | Cadastrar academia sem nome | Campo `nome` vazio | `status: "nok"` |
| CP27 | Academia | Alterar academia existente | ID válido + novos dados | `status: "ok"`, dados atualizados |
| CP28 | Academia | Excluir academia existente | ID válido | `status: "ok"`, academia removida |
| CP29 | Instrutor | Cadastrar novo instrutor | Dados válidos de instrutor | `status: "ok"`, instrutor criado |
| CP30 | Instrutor | Login do instrutor com credenciais válidas | Email e senha corretos | `status: "ok"`, sessão de instrutor criada |

### 4.2 Casos de Teste — Caixa Branca (Unitário)

Testam os caminhos internos (branches) da lógica de negócio, com base na cobertura de decisão das funções.

| ID | Função/Trecho Testado | Caminho Lógico Coberto | Entrada | Resultado Esperado (interno) |
|----|------------------------|--------------------------|----------|-------------------------------|
| CB01 | Cálculo de `dias_vencimento` (`mensalidade_get.php`) | Ramo `dias_vencimento > 0` (mensalidade vencida) | `dataVencimento` = data passada (ex.: 8 dias atrás) | Retorna `dias_vencimento = 8`, `status_display = "Vencido"` |
| CB02 | Cálculo de `dias_vencimento` (`mensalidade_get.php`) | Ramo `dias_vencimento < 0` (ainda não venceu) | `dataVencimento` = data futura (ex.: 7 dias à frente) | Retorna `dias_vencimento = -7`, `status_display = "Pendente"`, mensagem "7 dias para vencer" |
| CB03 | Cálculo de `dias_vencimento` (`mensalidade_get.php`) | Ramo `dias_vencimento == 0` (vence hoje) | `dataVencimento` = data atual | Retorna `dias_vencimento = 0`, mensagem "Vence hoje!" |
| CB04 | Validação de credenciais (`usuario_login.php`) | Ambos os ramos do `if` de comparação de senha (senha confere / não confere) | (a) senha em texto plano igual à armazenada; (b) senha diferente | (a) fluxo segue para criação de sessão; (b) fluxo retorna erro antes de iniciar sessão |
| CB05 | Validação de campos obrigatórios (`aluno_novo.php`) | Curto-circuito: cada condicional de campo vazio interrompe o fluxo antes do INSERT | Requisição com apenas o campo `nome` ausente (demais válidos) | Função retorna `status: "nok"` na primeira validação que falha, sem executar o INSERT no banco |
