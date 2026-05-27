<?php
    session_start();
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    // Verifica se o aluno está logado na sessão
    // Adapte 'id' de acordo com a variável que você usa no seu login_aluno.php
    if(isset($_SESSION['usuario']['id'])) {
        $id_usuario = (int)$_SESSION['usuario']['id'];

        // 1. Regra de Negócio: Verifica se já existe um check-in HOJE
        $sql_verifica = "SELECT id FROM Frequencia WHERE aluno_id = ? AND dataPresenca = CURDATE()";
        $stmt_verifica = $conexao->prepare($sql_verifica);
        $stmt_verifica->bind_param("i", $id_usuario);
        $stmt_verifica->execute();
        $resultado_verifica = $stmt_verifica->get_result();

        if($resultado_verifica->num_rows > 0) {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Você já confirmou sua presença no treino de hoje! OSS!',
                'data'      => []
            ];
        } else {
            $sql_insert = "INSERT INTO Frequencia (dataPresenca, presenca, aluno_id) VALUES (CURDATE(), 1, ?)";
            $stmt_insert = $conexao->prepare($sql_insert);
            $stmt_insert->bind_param("i", $id_usuario);
            
            if($stmt_insert->execute()) {
                $retorno = [
                    'status'    => 'ok',
                    'mensagem'  => 'Presença registrada com sucesso.',
                    'data'      => []
                ];
            } else {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Erro ao salvar no banco de dados.',
                    'data'      => []
                ];
            }
            $stmt_insert->close();
        }
        $stmt_verifica->close();

    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Acesso negado. Sessão expirada ou usuário não logado.',
            'data'      => []
        ];
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>