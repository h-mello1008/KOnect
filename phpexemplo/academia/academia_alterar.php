<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $nome = $_POST['nome'] ?? '';
        $endereco = $_POST['endereco'] ?? '';
        $status_ativo = isset($_POST['status_ativo']) ? (int)$_POST['status_ativo'] : 1;
    
        $stmt = $conexao->prepare("
            UPDATE Academia SET 
                nome = ?, endereco = ?, status_ativo = ?
            WHERE id = ?
        ");
        $stmt->bind_param("ssii", $nome, $endereco, $status_ativo, $_GET['id']);
        $stmt->execute();

        if($stmt->affected_rows > 0 || $stmt->error == ''){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Academia alterada com sucesso',
                'data'      => []
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao alterar academia',
                'data'      => []
            ];
        }
        $stmt->close();
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID da academia não informado',
            'data'      => []
        ];
    }
       
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>

