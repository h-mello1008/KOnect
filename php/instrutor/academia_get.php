<?php
    include_once('../conexao.php');

    header('Content-type: application/json; charset=utf-8');

    $stmt = $conexao->prepare("SELECT id, nome FROM Academia WHERE status_ativo = 1 ORDER BY nome ASC");

    if (!$stmt) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro na consulta.', 'data' => []]);
        exit;
    }

    $stmt->execute();
    $resultado = $stmt->get_result();

    $academias = [];
    while ($row = $resultado->fetch_assoc()) {
        $academias[] = $row;
    }

    $stmt->close();
    $conexao->close();

    echo json_encode(['status' => 'ok', 'mensagem' => '', 'data' => $academias]);
?>
