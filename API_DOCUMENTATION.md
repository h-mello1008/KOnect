# KOnect - API REST

## Estrutura de Banco de Dados

A aplicação utiliza o banco de dados `konnect` com as seguintes tabelas relacionadas:

### Tabelas Base

- **Usuario**: Usuários do sistema (email, senha)
- **Academia**: Academias cadastradas
- **Graduacao**: Níveis de graduação/faixa

### Tabelas de Usuários Específicos

- **Admin**: Administradores do sistema
- **Instrutor**: Instrutores das academias
- **Aluno**: Alunos matriculados

### Tabelas de Negócio

- **Modalidade**: Tipos de modalidades/esportes
- **Turma**: Turmas/aulas
- **Aluno_Turma**: Relacionamento muitos-para-muitos entre alunos e turmas
- **Aula**: Aulas específicas
- **Matricula**: Matrículas de alunos
- **Mensalidade**: Mensalidades das matrículas
- **ExameFaixa**: Exames de faixa
- **Frequencia**: Frequência em aulas
- **Produto**: Produtos/itens da academia

## Padrão de Retorno

Todas as requisições retornam JSON no seguinte padrão:

```json
{
  "status": "ok|nok",
  "mensagem": "Mensagem descritiva",
  "data": []
}
```

## Endpoints da API

### Usuário

- `POST /php/usuario/usuario_novo.php` - Registrar novo usuário
- `POST /php/usuario/usuario_login.php` - Login de usuário
- `GET /php/usuario/usuario_get.php[?id=X]` - Obter usuário(s)
- `GET /php/usuario/usuario_logoff.php` - Logout

### Instrutor

- `POST /php/instrutor/instrutor_novo.php` - Registrar novo instrutor
- `GET /php/instrutor/instrutor_get.php[?id=X]` - Obter instrutor(es)
- `POST /php/instrutor/instrutor_alterar.php?id=X` - Alterar instrutor
- `GET /php/instrutor/instrutor_excluir.php?id=X` - Excluir instrutor

### Aluno

- `POST /php/aluno/aluno_novo.php` - Registrar novo aluno
- `GET /php/aluno/aluno_get.php[?id=X]` - Obter aluno(s)
- `POST /php/aluno/aluno_alterar.php?id=X` - Alterar aluno
- `GET /php/aluno/aluno_excluir.php?id=X` - Excluir aluno

### Admin

- `POST /php/admin/admin_novo.php` - Registrar novo admin
- `GET /php/admin/admin_get.php[?id=X]` - Obter admin(ens)
- `POST /php/admin/admin_alterar.php?id=X` - Alterar admin
- `GET /php/admin/admin_excluir.php?id=X` - Excluir admin

### Academia

- `POST /php/academia/academia_novo.php` - Registrar nova academia
- `GET /php/academia/academia_get.php[?id=X]` - Obter academia(s)
- `POST /php/academia/academia_alterar.php?id=X` - Alterar academia
- `GET /php/academia/academia_excluir.php?id=X` - Excluir academia

### Turma

- `POST /php/turma/turma_novo.php` - Criar nova turma
- `GET /php/turma/turma_get.php[?id=X]` - Obter turma(s)
- `POST /php/turma/turma_alterar.php?id=X` - Alterar turma
- `GET /php/turma/turma_excluir.php?id=X` - Excluir turma

### Graduação

- `POST /php/graduacao/graduacao_novo.php` - Registrar nova graduação
- `GET /php/graduacao/graduacao_get.php[?id=X]` - Obter graduação(ões)
- `POST /php/graduacao/graduacao_alterar.php?id=X` - Alterar graduação
- `GET /php/graduacao/graduacao_excluir.php?id=X` - Excluir graduação

### Matrícula

- `POST /php/matricula/matricula_novo.php` - Criar nova matrícula
- `GET /php/matricula/matricula_get.php[?id=X]` - Obter matrícula(s)
- `POST /php/matricula/matricula_alterar.php?id=X` - Alterar matrícula
- `GET /php/matricula/matricula_excluir.php?id=X` - Excluir matrícula

## Validação de Sessão

Para validar se um usuário está autenticado:

```
GET /php/valida_sessao.php
```

Retorna a sessão do usuário se autenticado.

## Segurança

- Todas as requisições utilizam **Prepared Statements** para prevenção de SQL Injection
- Autenticação via **sessão PHP** (session_start)
- Senhas são armazenadas em texto simples (Considerar implementar hash com password_hash/password_verify)

## Conexão com Banco de Dados

A configuração de conexão está em `/php/conexao.php`:

```php
$servidor = "localhost:3306";
$usuario  = "root";
$senha    = "";
$nome_banco = "konnect";
```

## Próximas Melhorias

1. Implementar hash de senhas com `password_hash()` e `password_verify()`
2. Adicionar validações mais robustas
3. Implementar JWT para autenticação stateless
4. Adicionar logs de auditoria
5. Implementar CORS para requisições cross-origin
6. Adicionar testes automatizados
