<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $nome = $_POST['nome'] ?? '';
    $telefone = $_POST['telefone'] ?? '';
    $cpf = $_POST['cpf'] ?? '';
    $dataNascimento = (!empty($_POST['dataNascimento'])) ? $_POST['dataNascimento'] : null;
    $nome_fantasia = $_POST['nome_fantasia'] ?? '';
    $razao_social = $_POST['razao_social'] ?? '';
    $cnpj = $_POST['cnpj'] ?? '';
    $horario_abertura = $_POST['horario_abertura'] ?? '';
    $horario_fechamento = $_POST['horario_fechamento'] ?? '';
    $periodo_contrato = $_POST['periodo_contrato'] ?? '';
    $renovacao_automatica = isset($_POST['renovacao_automatica']) ? (int)$_POST['renovacao_automatica'] : 0;
    $aceitou_termos = isset($_POST['aceitou_termos']) ? (int)$_POST['aceitou_termos'] : 0;
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';
    $raw_academia_id = $_POST['academia_id'] ?? null;
    $academia_id = (!empty($raw_academia_id) && $raw_academia_id !== 'null') ? (int)$raw_academia_id : null;

    if(empty($email) || empty($senha) || empty($nome)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Email, senha e nome são obrigatórios',
            'data'      => []
        ];
    } else {
        session_start();

        try {
            // Inserir usuário base
            $stmt_usuario = $conexao->prepare("INSERT INTO Usuario(email, senha) VALUES(?, ?)");
            $stmt_usuario->bind_param("ss", $email, $senha);
            $stmt_usuario->execute();

            if($stmt_usuario->affected_rows > 0){
                $usuario_id = $stmt_usuario->insert_id;

                // Inserir instrutor
                $stmt_instrutor = $conexao->prepare("
                    INSERT INTO Instrutor(
                        id_usuario, nome, telefone_responsavel, cpf, dataNascimento,
                        nome_fantasia, razao_social, cnpj, horario_abertura,
                        horario_fechamento, periodo_contrato, renovacao_automatica, aceitou_termos, academia_id
                    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");

                $stmt_instrutor->bind_param(
                    "issssssssssiii",
                    $usuario_id, $nome, $telefone, $cpf, $dataNascimento,
                    $nome_fantasia, $razao_social, $cnpj, $horario_abertura,
                    $horario_fechamento, $periodo_contrato, $renovacao_automatica, $aceitou_termos, $academia_id
                );
                $stmt_instrutor->execute();

                if($stmt_instrutor->affected_rows > 0){
                    $_SESSION['usuario'] = [
                        'id' => $usuario_id,
                        'email' => $email,
                        'tipo' => 'instrutor'
                    ];

                    $retorno = [
                        'status'    => 'ok',
                        'mensagem'  => 'Instrutor registrado com sucesso',
                        'data'      => ['usuario_id' => $usuario_id]
                    ];
                } else {
                    $retorno = [
                        'status'    => 'nok',
                        'mensagem'  => 'Erro ao registrar instrutor: ' . $stmt_instrutor->error,
                        'data'      => []
                    ];
                }
                $stmt_instrutor->close();
            } else {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Erro ao criar usuário: ' . $stmt_usuario->error,
                    'data'      => []
                ];
            }
            $stmt_usuario->close();
        } catch (Exception $e) {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro no banco de dados: ' . $e->getMessage(),
                'data'      => []
            ];
        }
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
