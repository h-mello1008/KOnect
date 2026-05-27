<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;

    if($id <= 0) {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID do aluno é obrigatório',
            'data'      => []
        ];
    } else {
        try {
            // Verificar se o usuário existe
            $stmt_verifica = $conexao->prepare("
                SELECT id FROM Usuario 
                WHERE id = ?
            ");
            $stmt_verifica->bind_param("i", $id);
            $stmt_verifica->execute();
            $resultado_verifica = $stmt_verifica->get_result();

            if($resultado_verifica->num_rows === 0) {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Aluno não encontrado',
                    'data'      => []
                ];
            } else {
                // Deletar matrículas
                $stmt_matricula = $conexao->prepare("DELETE FROM Matricula WHERE aluno_id = ?");
                $stmt_matricula->bind_param("i", $id);
                $stmt_matricula->execute();

                // Deletar aulas/turmas
                $stmt_turma = $conexao->prepare("DELETE FROM Aluno_Turma WHERE aluno_id = ?");
                $stmt_turma->bind_param("i", $id);
                $stmt_turma->execute();

                // Deletar dados do aluno
                $stmt_aluno = $conexao->prepare("DELETE FROM Aluno WHERE id_usuario = ?");
                $stmt_aluno->bind_param("i", $id);
                $stmt_aluno->execute();

                // Deletar usuário
                $stmt_usuario = $conexao->prepare("DELETE FROM Usuario WHERE id = ?");
                $stmt_usuario->bind_param("i", $id);
                $stmt_usuario->execute();

                $retorno = [
                    'status'    => 'ok',
                    'mensagem'  => 'Aluno excluído com sucesso',
                    'data'      => []
                ];

                $stmt_matricula->close();
                $stmt_turma->close();
                $stmt_aluno->close();
                $stmt_usuario->close();
            }

            $stmt_verifica->close();
        } catch (Exception $e) {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao excluir aluno: ' . $e->getMessage(),
                'data'      => []
            ];
        }
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
