<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $corFaixa = $_POST['corFaixa'] ?? '';
    $hierarquia = $_POST['hierarquia'] ?? '';
    $tempoMinimo = $_POST['tempoMinimo'] ?? null;

    if(empty($corFaixa)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Cor da faixa é obrigatória',
            'data'      => []
        ];
    } else {
        $stmt = $conexao->prepare("INSERT INTO Graduacao(corFaixa, hierarquia, tempoMinimo) VALUES(?, ?, ?)");
        $stmt->bind_param("ssi", $corFaixa, $hierarquia, $tempoMinimo);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Graduação registrada com sucesso',
                'data'      => ['graduacao_id' => $stmt->insert_id]
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao registrar graduação',
                'data'      => []
            ];
        }
        $stmt->close();
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
