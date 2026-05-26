<?php
    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    include_once('../conexao.php');

    header('Content-type: application/json; charset=utf-8');

    $retorno = ['status' => '', 'mensagem' => ''];

    $id_aluno      = isset($_POST['id_aluno'])      ? (int)$_POST['id_aluno']           : 0;
    $data_validade = isset($_POST['data_validade'])  ? trim($_POST['data_validade'])       : '';

    if ($id_aluno <= 0) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'ID do aluno inválido.']);
        exit;
    }

    if ($data_validade === '') {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Campo obrigatório não preenchido: data de validade.']);
        exit;
    }

    if (!isset($_FILES['arquivo']) || $_FILES['arquivo']['error'] === UPLOAD_ERR_NO_FILE) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Nenhum arquivo enviado.']);
        exit;
    }

    $arquivo = $_FILES['arquivo'];

    if ($arquivo['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro no envio do arquivo.']);
        exit;
    }

    $tamanho_max = 5 * 1024 * 1024;
    if ($arquivo['size'] > $tamanho_max) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Arquivo muito grande. Tamanho máximo: 5 MB.']);
        exit;
    }

    $tipos_permitidos = ['application/pdf', 'image/jpeg', 'image/png'];
    $exts_permitidas  = ['pdf', 'jpg', 'jpeg', 'png'];

    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mime     = $finfo->file($arquivo['tmp_name']);
    $ext_orig = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));

    if (!in_array($mime, $tipos_permitidos) || !in_array($ext_orig, $exts_permitidas)) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Formato de arquivo inválido. Use PDF, JPG ou PNG.']);
        exit;
    }

    $dir = __DIR__ . '/../../uploads/atestados/' . $id_aluno . '/';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $nome_final = 'atestado_' . time() . '.' . $ext_orig;
    $caminho    = $dir . $nome_final;

    if (!move_uploaded_file($arquivo['tmp_name'], $caminho)) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Falha ao salvar o arquivo no servidor.']);
        exit;
    }

    $caminho_relativo = 'uploads/atestados/' . $id_aluno . '/' . $nome_final;

    $stmt_sub = $conexao->prepare("UPDATE AtestadoMedico SET status='Substituído' WHERE aluno_id=? AND status='Ativo'");
    $stmt_sub->bind_param('i', $id_aluno);
    $stmt_sub->execute();
    $stmt_sub->close();

    $stmt_ins = $conexao->prepare("
        INSERT INTO AtestadoMedico (aluno_id, nome_arquivo, caminho_arquivo, tipo_arquivo, data_validade, status)
        VALUES (?, ?, ?, ?, ?, 'Ativo')
    ");
    $stmt_ins->bind_param('issss', $id_aluno, $arquivo['name'], $caminho_relativo, $ext_orig, $data_validade);
    $stmt_ins->execute();
    $stmt_ins->close();

    $stmt_upd = $conexao->prepare("UPDATE Aluno SET atestadoMedico=1 WHERE id_usuario=?");
    $stmt_upd->bind_param('i', $id_aluno);
    $stmt_upd->execute();
    $stmt_upd->close();

    $conexao->close();

    echo json_encode(['status' => 'ok', 'mensagem' => 'Atestado salvo com sucesso. Status de aptidão atualizado.']);
?>
