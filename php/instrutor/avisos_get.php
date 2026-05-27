<?php
session_start();
include_once('../conexao.php');

header("Content-type: application/json; charset: utf-8;");

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Usuário não autenticado', 'data' => []]);
    exit;
}

$usuario_id = $_SESSION['usuario']['id'];

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

$stmt = $conexao->prepare("
    SELECT a.id, a.titulo, a.mensagem, a.data_criacao
    FROM Avisos a
    WHERE a.academia_id = ? AND a.ativo = 1
    ORDER BY a.data_criacao DESC
");
$stmt->bind_param("i", $academia_id);
$stmt->execute();
$resultado = $stmt->get_result();
$stmt->close();

$avisos = [];
while ($linha = $resultado->fetch_assoc()) {
    $avisos[] = $linha;
}

echo json_encode(['status' => 'ok', 'mensagem' => 'Avisos encontrados', 'data' => $avisos]);
?>
