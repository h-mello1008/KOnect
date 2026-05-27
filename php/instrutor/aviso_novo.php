<?php
session_start();
include_once('../conexao.php');

header("Content-type: application/json; charset: utf-8;");

$retorno = ['status' => '', 'mensagem' => '', 'data' => []];

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Usuário não autenticado', 'data' => []]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Método inválido', 'data' => []]);
    exit;
}

$titulo   = trim($_POST['titulo'] ?? '');
$mensagem = trim($_POST['mensagem'] ?? '');
$usuario_id = $_SESSION['usuario']['id'];

if (empty($titulo) || empty($mensagem)) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Título e mensagem são obrigatórios', 'data' => []]);
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

$stmt = $conexao->prepare("INSERT INTO Avisos (titulo, mensagem, instrutor_id, academia_id) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssii", $titulo, $mensagem, $usuario_id, $academia_id);

if ($stmt->execute()) {
    $aviso_id = $stmt->insert_id;
    $stmt->close();

    $stmt = $conexao->prepare("SELECT id, titulo, mensagem, data_criacao FROM Avisos WHERE id = ?");
    $stmt->bind_param("i", $aviso_id);
    $stmt->execute();
    $aviso = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    echo json_encode(['status' => 'ok', 'mensagem' => 'Aviso publicado com sucesso', 'data' => $aviso]);
} else {
    $stmt->close();
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao salvar aviso', 'data' => []]);
}
?>
