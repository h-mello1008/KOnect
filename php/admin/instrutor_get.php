<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if (isset($_GET['id'])) {
        $stmt = $conexao->prepare("
            SELECT u.email, i.*, a.nome AS academia_nome
            FROM Usuario u
            JOIN Instrutor i ON u.id = i.id_usuario
            LEFT JOIN Academia a ON i.academia_id = a.id
            WHERE i.id_usuario = ?
        ");
        $stmt->bind_param("i", $_GET['id']);
    } else {
        $stmt = $conexao->prepare("
            SELECT u.email, i.*, a.nome AS academia_nome
            FROM Usuario u
            JOIN Instrutor i ON u.id = i.id_usuario
            LEFT JOIN Academia a ON i.academia_id = a.id
            ORDER BY i.nome ASC
        ");
    }

    $stmt->execute();
    $resultado = $stmt->get_result();
    $tabela = [];

    if ($resultado->num_rows > 0) {
        while ($linha = $resultado->fetch_assoc()) {
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
            'mensagem'  => 'Nenhum instrutor encontrado',
            'data'      => []
        ];
    }

    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
