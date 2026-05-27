<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
    $nome = $_POST['nome'] ?? '';
    $email = $_POST['email'] ?? '';
    $telefone = $_POST['telefone'] ?? '';
    $status_ativo = isset($_POST['status_ativo']) ? (int)$_POST['status_ativo'] : 1;

    if($id <= 0 || empty($nome)) {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID do aluno e nome são obrigatórios',
            'data'      => []
        ];
    } else {
        try {
            // Atualizar dados do usuário
            $stmt_usuario = $conexao->prepare("
                UPDATE Usuario 
                SET email = ?
                WHERE id = ?
            ");
            $stmt_usuario->bind_param("si", $email, $id);
            $stmt_usuario->execute();

            // Atualizar dados do aluno
            $stmt_aluno = $conexao->prepare("
                UPDATE Aluno 
                SET nome = ?, telefone = ?
                WHERE id_usuario = ?
            ");
            $stmt_aluno->bind_param("ssi", $nome, $telefone, $id);
            $stmt_aluno->execute();

            // Atualizar status da matrícula
            $status_matricula = $status_ativo ? 'Ativo' : 'Inativo';
            $stmt_matricula = $conexao->prepare("
                UPDATE Matricula 
                SET status_matricula = ?
                WHERE aluno_id = ?
            ");
            $stmt_matricula->bind_param("si", $status_matricula, $id);
            $stmt_matricula->execute();

            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Aluno atualizado com sucesso',
                'data'      => []
            ];

            $stmt_usuario->close();
            $stmt_aluno->close();
            $stmt_matricula->close();
        } catch (Exception $e) {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao atualizar aluno: ' . $e->getMessage(),
                'data'      => []
            ];
        }
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
