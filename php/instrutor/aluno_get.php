<?php
    include_once('../conexao.php'); // Ajuste o caminho do conexao.php se necessário

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    // Se passar ID, busca um específico. Se não, busca todos.
    if(isset($_GET['id'])){
        $stmt = $conexao->prepare("
            SELECT u.email, a.* FROM Usuario u 
            JOIN Aluno a ON u.id = a.id_usuario 
            WHERE a.id_usuario = ?
        ");
        $stmt->bind_param("i", $_GET['id']);
    } else {
        $stmt = $conexao->prepare("
            SELECT u.email, a.* FROM Usuario u 
            JOIN Aluno a ON u.id = a.id_usuario
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
            'mensagem'  => 'Nenhum aluno encontrado',
            'data'      => []
        ];
    }
    
    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>