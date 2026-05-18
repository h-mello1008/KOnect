<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $stmt = $conexao->prepare("
            SELECT m.*, a.nome as aluno_nome, mod.tipo as modalidade_tipo, ac.nome as academia_nome
            FROM Matricula m
            LEFT JOIN Aluno a ON m.aluno_id = a.id_usuario
            LEFT JOIN Modalidade mod ON m.modalidade_id = mod.id
            LEFT JOIN Academia ac ON m.academia_id = ac.id
            WHERE m.id = ?
        ");
        $stmt->bind_param("i", $_GET['id']);
    } else {
        $stmt = $conexao->prepare("
            SELECT m.*, a.nome as aluno_nome, mod.tipo as modalidade_tipo, ac.nome as academia_nome
            FROM Matricula m
            LEFT JOIN Aluno a ON m.aluno_id = a.id_usuario
            LEFT JOIN Modalidade mod ON m.modalidade_id = mod.id
            LEFT JOIN Academia ac ON m.academia_id = ac.id
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
            'mensagem'  => 'Nenhuma matrícula encontrada',
            'data'      => []
        ];
    }
    
    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
