<?php
    session_start();
    include_once('../conexao.php');

    header("Content-type: application/json; charset: utf-8;");

    if (!isset($_SESSION['usuario'])) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Usuário não autenticado', 'data' => []]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Método inválido', 'data' => []]);
        exit;
    }

    $usuario_id = (int)$_SESSION['usuario']['id'];
    $mensalidade_id = (int)($_POST['id'] ?? 0);

    if ($mensalidade_id <= 0) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'ID da mensalidade inválido', 'data' => []]);
        exit;
    }

    // Verifica que a mensalidade pertence ao aluno logado e está pendente/vencida
    $stmt = $conexao->prepare("
        SELECT m.id
        FROM Mensalidade m
        INNER JOIN Matricula mat ON m.matricula_id = mat.id
        WHERE m.id = ? AND mat.aluno_id = ? AND m.status_pagamento IN ('Pendente', 'Vencido')
    ");
    $stmt->bind_param("ii", $mensalidade_id, $usuario_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 0) {
        $stmt->close();
        echo json_encode(['status' => 'nok', 'mensagem' => 'Mensalidade não encontrada ou já paga', 'data' => []]);
        exit;
    }
    $stmt->close();

    $stmt = $conexao->prepare("
        UPDATE Mensalidade SET status_pagamento = 'Pago', data_pagamento = CURDATE()
        WHERE id = ?
    ");
    $stmt->bind_param("i", $mensalidade_id);
    $stmt->execute();

    if ($stmt->errno === 0) {
        $stmt->close();
        echo json_encode(['status' => 'ok', 'mensagem' => 'Pagamento registrado com sucesso!', 'data' => []]);
    } else {
        $stmt->close();
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao registrar pagamento', 'data' => []]);
    }
?>
