<?php
session_start();
include_once('../conexao.php');

header("Content-type: application/json; charset: utf-8;");

if (!isset($_SESSION['usuario'])) {
    echo json_encode(['status' => 'nok', 'mensagem' => 'Usuário não autenticado', 'data' => []]);
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

$usuario_id = $_SESSION['usuario']['id'];

$stmt = $conexao->prepare("
    SELECT academia_id FROM Matricula
    WHERE aluno_id = ? AND status_matricula = 'Ativo'
    LIMIT 1
");
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$res || !$res['academia_id']) {
    echo json_encode(['status' => 'ok', 'mensagem' => 'Nenhuma matrícula ativa', 'data' => []]);
    exit;
}

$academia_id = $res['academia_id'];

$stmt = $conexao->prepare("
    SELECT id, dia, TIME_FORMAT(hora, '%H:%i') AS hora, modalidade
    FROM Agenda
    WHERE academia_id = ? AND ativo = 1
    ORDER BY FIELD(dia, 'seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'), hora
");
$stmt->bind_param("i", $academia_id);
$stmt->execute();
$resultado = $stmt->get_result();
$stmt->close();

$aulas = [];
while ($linha = $resultado->fetch_assoc()) {
    $aulas[] = $linha;
}

echo json_encode(['status' => 'ok', 'mensagem' => 'Agenda encontrada', 'data' => $aulas]);
?>
