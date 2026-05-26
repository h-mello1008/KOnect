<?php
    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    include_once('../conexao.php');

    $retorno = [
        'status'   => '',
        'mensagem' => '',
        'total'    => 0,
        'data'     => []
    ];

    if (!isset($_GET['id'])) {
        $retorno = ['status' => 'nok', 'mensagem' => 'ID do aluno não fornecido.', 'total' => 0, 'data' => []];
        header("Content-type: application/json; charset=utf-8");
        echo json_encode($retorno);
        exit;
    }

    $id_aluno    = (int)$_GET['id'];
    $data_inicio = isset($_GET['data_inicio']) && $_GET['data_inicio'] !== '' ? $_GET['data_inicio'] : null;
    $data_fim    = isset($_GET['data_fim'])    && $_GET['data_fim']    !== '' ? $_GET['data_fim']    : null;

    $sql = "
        SELECT
            f.dataPresenca,
            DATE_FORMAT(au.dataHora, '%H:%i') AS horario_checkin,
            au.conteudoTreinado,
            au.duracao,
            m.tipo AS modalidade,
            inst.nome AS instrutor_nome
        FROM Frequencia f
        JOIN Aula au       ON f.aula_id        = au.id
        JOIN Turma t       ON au.turma_id       = t.codigoTurma
        JOIN Modalidade m  ON t.modalidade_id   = m.id
        JOIN Instrutor inst ON t.instrutor_id   = inst.id_usuario
        WHERE f.aluno_id = ?
          AND f.presenca = 1
    ";

    $params = [$id_aluno];
    $tipos  = "i";

    if ($data_inicio) {
        $sql .= " AND f.dataPresenca >= ?";
        $params[] = $data_inicio;
        $tipos   .= "s";
    }

    if ($data_fim) {
        $sql .= " AND f.dataPresenca <= ?";
        $params[] = $data_fim;
        $tipos   .= "s";
    }

    $sql .= " ORDER BY au.dataHora DESC";

    $stmt = $conexao->prepare($sql);

    if (!$stmt) {
        $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao preparar consulta: ' . $conexao->error, 'total' => 0, 'data' => []];
        header("Content-type: application/json; charset=utf-8");
        echo json_encode($retorno);
        exit;
    }

    $stmt->bind_param($tipos, ...$params);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $registros = [];
    while ($row = $resultado->fetch_assoc()) {
        $registros[] = [
            'data'            => $row['dataPresenca'],
            'horario'         => $row['horario_checkin'],
            'modalidade'      => $row['modalidade'],
            'conteudo'        => $row['conteudoTreinado'] ?? '',
            'instrutor'       => $row['instrutor_nome'],
        ];
    }

    $stmt->close();
    $conexao->close();

    $retorno = [
        'status'   => 'ok',
        'mensagem' => count($registros) . ' registro(s) encontrado(s).',
        'total'    => count($registros),
        'data'     => $registros
    ];

    header("Content-type: application/json; charset=utf-8");
    $json = json_encode($retorno);
    echo $json === false
        ? json_encode(['status' => 'nok', 'mensagem' => 'Erro interno de serialização.', 'total' => 0, 'data' => []])
        : $json;
?>
