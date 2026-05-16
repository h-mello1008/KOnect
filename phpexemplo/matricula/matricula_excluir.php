<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        // Delete da matrícula e mensalidade associada
        $stmt_mensalidade = $conexao->prepare("DELETE FROM Mensalidade WHERE matricula_id = ?");
        $stmt_mensalidade->bind_param("i", $_GET['id']);
        $stmt_mensalidade->execute();
        
        $stmt = $conexao->prepare("DELETE FROM Matricula WHERE id = ?");
        $stmt->bind_param("i", $_GET['id']);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Matrícula excluída com sucesso',
                'data'      => []
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Matrícula não encontrada',
                'data'      => []
            ];
        }
        $stmt->close();
        $stmt_mensalidade->close();
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID da matrícula não informado',
            'data'      => []
        ];
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
