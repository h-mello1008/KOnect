<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $corFaixa = $_POST['corFaixa'] ?? '';
        $hierarquia = $_POST['hierarquia'] ?? '';
        $tempoMinimo = $_POST['tempoMinimo'] ?? null;
    
        $stmt = $conexao->prepare("
            UPDATE Graduacao SET 
                corFaixa = ?, hierarquia = ?, tempoMinimo = ?
            WHERE id = ?
        ");
        $stmt->bind_param("ssii", $corFaixa, $hierarquia, $tempoMinimo, $_GET['id']);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Graduação alterada com sucesso',
                'data'      => []
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao alterar graduação',
                'data'      => []
            ];
        }
        $stmt->close();
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID da graduação não informado',
            'data'      => []
        ];
    }
       
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
