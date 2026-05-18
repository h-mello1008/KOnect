<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        // Primeiro delete do Aluno, depois do Usuario
        $stmt = $conexao->prepare("DELETE FROM Aluno WHERE id_usuario = ?");
        $stmt->bind_param("i", $_GET['id']);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $stmt_usuario = $conexao->prepare("DELETE FROM Usuario WHERE id = ?");
            $stmt_usuario->bind_param("i", $_GET['id']);
            $stmt_usuario->execute();

            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Aluno excluído com sucesso',
                'data'      => []
            ];
            $stmt_usuario->close();
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Aluno não encontrado',
                'data'      => []
            ];
        }
        $stmt->close();
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID do aluno não informado',
            'data'      => []
        ];
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
