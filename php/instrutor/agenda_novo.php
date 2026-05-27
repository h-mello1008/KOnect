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

$conexao->query("
    CREATE TABLE IF NOT EXISTS Agenda (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dia VARCHAR(3) NOT NULL,
        hora TIME NOT NULL,
        modalidade VARCHAR(255) NOT NULL,
        instrutor_id INT NOT NULL,
        academia_id INT NOT NULL,
        ativo TINYINT(1) DEFAULT 1,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (instrutor_id) REFERENCES Instrutor(id_usuario),
        FOREIGN KEY (academia_id) REFERENCES Academia(id)
    )
");

$dia = trim($_POST['dia'] ?? '');
$hora = trim($_POST['hora'] ?? '');
$modalidade = trim($_POST['modalidade'] ?? '');
$usuario_id = $_SESSION['usuario']['id'];
$dias_permitidos = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

if (!in_array($dia, $dias_permitidos, true) || empty($hora) || empty($modalidade)) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Dia, horário e modalidade são obrigatórios', 'data' => []]);
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

$stmt = $conexao->prepare("INSERT INTO Agenda (dia, hora, modalidade, instrutor_id, academia_id) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssii", $dia, $hora, $modalidade, $usuario_id, $academia_id);

if ($stmt->execute()) {
    $agenda_id = $stmt->insert_id;
    $stmt->close();

    $stmt = $conexao->prepare("SELECT id, dia, TIME_FORMAT(hora, '%H:%i') AS hora, modalidade FROM Agenda WHERE id = ?");
    $stmt->bind_param("i", $agenda_id);
    $stmt->execute();
    $aula = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    echo json_encode(['status' => 'ok', 'mensagem' => 'Aula agendada com sucesso', 'data' => $aula]);
} else {
    $stmt->close();
    echo json_encode(['status' => 'nok', 'mensagem' => 'Erro ao salvar aula', 'data' => []]);
}
?>
