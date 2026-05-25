<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $id_usuario = (int)$_GET['id'];

        $stmt_aluno = $conexao->prepare("DELETE FROM Aluno WHERE id_usuario = ?");
        $stmt_aluno->bind_param("i", $id_usuario);
        $stmt_aluno->execute();

        if($stmt_aluno->affected_rows > 0 || $stmt_aluno->errno === 0){
            $stmt_usuario = $conexao->prepare("DELETE FROM Usuario WHERE id = ?");
            $stmt_usuario->bind_param("i", $id_usuario);
            $stmt_usuario->execute();

            if($stmt_usuario->affected_rows > 0){
                $retorno = [
                    'status'    => 'ok',
                    'mensagem'  => 'Registro do aluno excluído permanentemente.',
                    'data'      => []
                ];
            } else {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Erro ao excluir conta de usuário base.',
                    'data'      => []
                ];
            }
            $stmt_usuario->close();
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Aluno não encontrado ou já excluído.',
                'data'      => []
            ];
        }
        $stmt_aluno->close();
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID do aluno não informado.',
            'data'      => []
        ];
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>