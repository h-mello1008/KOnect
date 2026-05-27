<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $usuario_id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
    $academia_id = isset($_POST['academia_id']) ? (int)$_POST['academia_id'] : 0;
    $modalidade_id = isset($_POST['modalidade_id']) ? (int)$_POST['modalidade_id'] : 0;

    if($usuario_id <= 0 || $academia_id <= 0 || $modalidade_id <= 0) {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID do usuário, academia e modalidade são obrigatórios',
            'data'      => []
        ];
    } else {
        try {
            // Atualizar a tabela Aluno com academia_id e modalidade_id
            $stmt = $conexao->prepare("
                UPDATE Aluno 
                SET academia_id = ?, modalidade_id = ?
                WHERE id_usuario = ?
            ");
            $stmt->bind_param("iii", $academia_id, $modalidade_id, $usuario_id);
            $stmt->execute();

            if($stmt->affected_rows > 0 || $stmt->error == "") {
                $retorno = [
                    'status'    => 'ok',
                    'mensagem'  => 'Aluno vinculado à academia com sucesso',
                    'data'      => []
                ];
            } else {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Erro ao vincular aluno à academia',
                    'data'      => []
                ];
            }

            $stmt->close();
        } catch (Exception $e) {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao vincular aluno: ' . $e->getMessage(),
                'data'      => []
            ];
        }
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
