<?php
    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    include_once('../conexao.php');

    $retorno = ['status' => '', 'mensagem' => '', 'data' => null];

    if (!isset($_GET['id'])) {
        $retorno = ['status' => 'nok', 'mensagem' => 'ID não fornecido.', 'data' => null];
        header('Content-type: application/json; charset=utf-8');
        echo json_encode($retorno);
        exit;
    }

    $id_aluno = (int)$_GET['id'];

    $stmt = $conexao->prepare("
        SELECT id, nome_arquivo, data_upload, data_validade, status
        FROM AtestadoMedico
        WHERE aluno_id = ?
        ORDER BY data_upload DESC
        LIMIT 1
    ");

    if (!$stmt) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro na consulta.', 'data' => null]);
        exit;
    }

    $stmt->bind_param('i', $id_aluno);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $row = $resultado->fetch_assoc();

        if ($row['status'] === 'Ativo' && strtotime($row['data_validade']) < time()) {
            $conexao->query("UPDATE AtestadoMedico SET status='Expirado' WHERE id=" . (int)$row['id']);
            $row['status'] = 'Expirado';
        }

        $retorno = ['status' => 'ok', 'mensagem' => 'Atestado encontrado.', 'data' => [
            'nome_arquivo'   => $row['nome_arquivo'],
            'data_upload'    => $row['data_upload'],
            'data_validade'  => $row['data_validade'],
            'status'         => $row['status'],
        ]];
    } else {
        $retorno = ['status' => 'ok', 'mensagem' => 'Nenhum atestado cadastrado.', 'data' => null];
    }

    $stmt->close();
    $conexao->close();

    header('Content-type: application/json; charset=utf-8');
    echo json_encode($retorno);
?>
