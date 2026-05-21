<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $tempoMinimo    = $_POST['tempoMinimo'] ?? 0;
        $descricao      = $_POST['descricao'] ?? '';
        $requisitos     = $_POST['requisitos'] ?? '';
        $pontuacaoMinima = $_POST['pontuacaoMinima'] ?? 0;
    
        $stmt = $conexao->prepare("
            UPDATE GraduacaoRegra SET 
                tempoMinimo = ?, descricao = ?, requisitos = ?, pontuacaoMinima = ?
            WHERE id = ?
        ");
        $stmt->bind_param("isisi", $tempoMinimo, $descricao, $requisitos, $pontuacaoMinima, $_GET['id']);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Regra de graduação alterada com sucesso',
                'data'      => []
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao alterar regra de graduação',
                'data'      => []
            ];
        }
        $stmt->close();
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID da regra não informado',
            'data'      => []
        ];
    }
       
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
