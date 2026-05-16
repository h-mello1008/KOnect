<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $stmt = $conexao->prepare("
            SELECT t.*, m.tipo as modalidade_tipo, i.nome as instrutor_nome
            FROM Turma t
            LEFT JOIN Modalidade m ON t.modalidade_id = m.id
            LEFT JOIN Instrutor i ON t.instrutor_id = i.id_usuario
            WHERE t.codigoTurma = ?
        ");
        $stmt->bind_param("i", $_GET['id']);
    } else {
        $stmt = $conexao->prepare("
            SELECT t.*, m.tipo as modalidade_tipo, i.nome as instrutor_nome
            FROM Turma t
            LEFT JOIN Modalidade m ON t.modalidade_id = m.id
            LEFT JOIN Instrutor i ON t.instrutor_id = i.id_usuario
        ");
    }
    
    $stmt->execute();
    $resultado = $stmt->get_result();
    $tabela = [];
    
    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Consulta realizada com sucesso',
            'data'      => $tabela
        ];
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nenhuma turma encontrada',
            'data'      => []
        ];
    }
    
    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
