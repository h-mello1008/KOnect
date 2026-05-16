<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $nome = $_POST['nome'] ?? '';
    $cnpj = $_POST['cnpj'] ?? '';
    $endereco = $_POST['endereco'] ?? '';

    if(empty($nome)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nome da academia é obrigatório',
            'data'      => []
        ];
    } else {
        $stmt = $conexao->prepare("INSERT INTO Academia(nome, cnpj, endereco) VALUES(?, ?, ?)");
        $stmt->bind_param("sss", $nome, $cnpj, $endereco);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Academia registrada com sucesso',
                'data'      => ['academia_id' => $stmt->insert_id]
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao registrar academia',
                'data'      => []
            ];
        }
        $stmt->close();
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
