<?php
if (session_status() === PHP_SESSION_NONE) session_start();
include_once('../conexao.php');

$retorno = ['status' => '', 'mensagem' => '', 'data' => []];

parse_str(file_get_contents('php://input'), $delete_params);
$id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($delete_params['id']) ? (int)$delete_params['id'] : 0);

if ($id <= 0) {
    $retorno = ['status' => 'nok', 'mensagem' => 'ID inválido.', 'data' => []];
} else {
    try {
        $tabelas_dependentes = ['Frequencia', 'ExameFaixa', 'Matricula', 'Aluno_Turma'];
        foreach ($tabelas_dependentes as $tabela) {
            $stmt = $conexao->prepare("DELETE FROM $tabela WHERE aluno_id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $stmt->close();
        }

        $stmt_aluno = $conexao->prepare("DELETE FROM Aluno WHERE id_usuario = ?");
        $stmt_aluno->bind_param("i", $id);
        $stmt_aluno->execute();
        $stmt_aluno->close();

        $stmt_usuario = $conexao->prepare("DELETE FROM Usuario WHERE id = ?");
        $stmt_usuario->bind_param("i", $id);
        $stmt_usuario->execute();
        $stmt_usuario->close();

        $retorno = ['status' => 'ok', 'mensagem' => 'Aluno removido com sucesso.', 'data' => []];
    } catch (mysqli_sql_exception $e) {
        $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao remover aluno: ' . $e->getMessage(), 'data' => []];
    }
}

$conexao->close();
header("Content-Type: application/json; charset=utf-8");
echo json_encode($retorno);
?>
