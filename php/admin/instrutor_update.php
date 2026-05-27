<?php
    include_once('../conexao.php');

    $retorno = [
        'status'   => '',
        'mensagem' => '',
        'data'     => []
    ];

    $id_usuario           = isset($_POST['id_usuario']) ? (int)$_POST['id_usuario'] : 0;
    $nome                 = $_POST['nome'] ?? '';
    $email                = $_POST['email'] ?? '';
    $telefone             = $_POST['telefone_responsavel'] ?? '';
    $cpf                  = $_POST['cpf'] ?? '';
    $dataNascimento       = (!empty($_POST['dataNascimento'])) ? $_POST['dataNascimento'] : null;
    $nome_fantasia        = $_POST['nome_fantasia'] ?? '';
    $razao_social         = $_POST['razao_social'] ?? '';
    $cnpj                 = $_POST['cnpj'] ?? '';
    $horario_abertura     = $_POST['horario_abertura'] ?? '';
    $horario_fechamento   = $_POST['horario_fechamento'] ?? '';
    $periodo_contrato     = $_POST['periodo_contrato'] ?? '';
    $renovacao_automatica = isset($_POST['renovacao_automatica']) ? (int)$_POST['renovacao_automatica'] : 0;
    $raw_academia_id      = $_POST['academia_id'] ?? null;
    $academia_id          = (!empty($raw_academia_id) && $raw_academia_id !== 'null') ? (int)$raw_academia_id : null;

    if ($id_usuario <= 0 || empty($nome) || empty($email)) {
        $retorno = [
            'status'   => 'nok',
            'mensagem' => 'ID do instrutor, nome e email são obrigatórios.',
            'data'     => []
        ];
        header("Content-type:application/json;charset:utf-8");
        echo json_encode($retorno);
        exit;
    }

    try {
        $stmt_u = $conexao->prepare("UPDATE Usuario SET email = ? WHERE id = ?");
        $stmt_u->bind_param("si", $email, $id_usuario);
        $stmt_u->execute();
        $stmt_u->close();

        $stmt_i = $conexao->prepare("
            UPDATE Instrutor
            SET nome = ?, telefone_responsavel = ?, cpf = ?, dataNascimento = ?,
                nome_fantasia = ?, razao_social = ?, cnpj = ?,
                horario_abertura = ?, horario_fechamento = ?,
                periodo_contrato = ?, renovacao_automatica = ?, academia_id = ?
            WHERE id_usuario = ?
        ");
        $stmt_i->bind_param(
            "sssssssssisii",
            $nome, $telefone, $cpf, $dataNascimento,
            $nome_fantasia, $razao_social, $cnpj,
            $horario_abertura, $horario_fechamento,
            $periodo_contrato, $renovacao_automatica, $academia_id,
            $id_usuario
        );
        $stmt_i->execute();
        $stmt_i->close();

        $retorno = [
            'status'   => 'ok',
            'mensagem' => 'Instrutor atualizado com sucesso.',
            'data'     => []
        ];
    } catch (Exception $e) {
        $retorno = [
            'status'   => 'nok',
            'mensagem' => 'Erro no banco de dados: ' . $e->getMessage(),
            'data'     => []
        ];
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
