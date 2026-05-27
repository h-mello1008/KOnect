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
$dia = trim($_POST['dia'] ?? '');
$hora = trim($_POST['hora'] ?? '');
$modalidade = trim($_POST['modalidade'] ?? '');
$usuario_id = $_SESSION['usuario']['id'];
$dias_permitidos = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

if ($id <= 0 || !in_array($dia, $dias_permitidos, true) || empty($hora) || empty($modalidade)) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Dados obrigatórios não informados', 'data' => []]);
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

$stmt = $conexao->prepare("SELECT id FROM Agenda WHERE id = ? AND academia_id = ? AND ativo = 1");
$stmt->bind_param("ii", $id, $academia_id);
$stmt->execute();
$aula_existente = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$aula_existente) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Aula não encontrada', 'data' => []]);
    exit;
}

$stmt = $conexao->prepare("
    UPDATE Agenda
    SET dia = ?, hora = ?, modalidade = ?
    WHERE id = ? AND academia_id = ? AND ativo = 1
");
$stmt->bind_param("sssii", $dia, $hora, $modalidade, $id, $academia_id);
$stmt->execute();

if ($stmt->errno === 0 && $stmt->affected_rows >= 0) {
    $stmt->close();

    $stmt = $conexao->prepare("SELECT id, dia, TIME_FORMAT(hora, '%H:%i') AS hora, modalidade FROM Agenda WHERE id = ? AND academia_id = ?");
    $stmt->bind_param("ii", $id, $academia_id);
    $stmt->execute();
    $aula = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    echo json_encode(['status' => 'ok', 'mensagem' => 'Aula atualizada com sucesso', 'data' => $aula]);
} else {
    $stmt->close();
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao atualizar aula', 'data' => []]);
}
?>
