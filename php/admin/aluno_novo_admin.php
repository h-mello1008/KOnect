<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $nome        = $_POST['nome']           ?? '';
    $email       = $_POST['email']          ?? '';
    $senha       = $_POST['senha']          ?? '';
    $telefone    = $_POST['telefone']       ?? '';
    $cpf         = $_POST['cpf']            ?? '';
    $dataNasc    = empty($_POST['dataNascimento']) ? null : $_POST['dataNascimento'];
    $academia_id = !empty($_POST['academia_id'])   ? (int)$_POST['academia_id'] : null;

    if (empty($nome) || empty($email) || empty($senha)) {
        $retorno = ['status' => 'nok', 'mensagem' => 'Nome, e-mail e senha são obrigatórios.', 'data' => []];
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    try {
        // Verificar e-mail duplicado
        $stmtCheck = $conexao->prepare("SELECT id FROM Usuario WHERE email = ?");
        $stmtCheck->bind_param("s", $email);
        $stmtCheck->execute();
        $stmtCheck->store_result();
        if ($stmtCheck->num_rows > 0) {
            $stmtCheck->close();
            $conexao->close();
            $retorno = ['status' => 'nok', 'mensagem' => 'Este e-mail já está cadastrado.', 'data' => []];
            header("Content-type:application/json;charset:utf-8");
            echo json_encode($retorno);
            exit;
        }
        $stmtCheck->close();

        // Criar usuário
        $stmtU = $conexao->prepare("INSERT INTO Usuario(email, senha) VALUES(?, ?)");
        $stmtU->bind_param("ss", $email, $senha);
        $stmtU->execute();
        $usuario_id = $stmtU->insert_id;
        $stmtU->close();

        // Criar aluno
        $stmtA = $conexao->prepare("
            INSERT INTO Aluno(id_usuario, nome, telefone, dataNascimento)
            VALUES(?, ?, ?, ?)
        ");
        $stmtA->bind_param("isss", $usuario_id, $nome, $telefone, $dataNasc);
        $stmtA->execute();
        $stmtA->close();

        // Criar matrícula se academia informada
        if ($academia_id) {
            $dataInicio = date('Y-m-d');
            $stmtM = $conexao->prepare("
                INSERT INTO Matricula(dataInicio, status_matricula, aluno_id, academia_id)
                VALUES(?, 'Ativo', ?, ?)
            ");
            $stmtM->bind_param("sii", $dataInicio, $usuario_id, $academia_id);
            $stmtM->execute();
            $stmtM->close();
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Aluno criado com sucesso!',
            'data'      => ['usuario_id' => $usuario_id]
        ];
    } catch (mysqli_sql_exception $e) {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro no banco de dados: ' . $e->getMessage(),
            'data'      => []
        ];
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
