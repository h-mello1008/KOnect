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

$id = (int)($_POST['id'] ?? 0);
$usuario_id = $_SESSION['usuario']['id'];

if ($id <= 0) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'ID do aviso não informado', 'data' => []]);
    exit;
}

$stmt = $conexao->prepare("SELECT academia_id FROM Instrutor WHERE id_usuario = ?");
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$res || !$res['academia_id']) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Instrutor não encontrado', 'data' => []]);
    exit;
}

$academia_id = $res['academia_id'];

$stmt = $conexao->prepare("UPDATE Avisos SET ativo = 0 WHERE id = ? AND academia_id = ? AND ativo = 1");
$stmt->bind_param("ii", $id, $academia_id);
$stmt->execute();

if ($stmt->errno === 0 && $stmt->affected_rows > 0) {
    echo json_encode(['status' => 'ok', 'mensagem' => 'Aviso excluído com sucesso', 'data' => []]);
} else {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Aviso não encontrado', 'data' => []]);
}

$stmt->close();
?>
