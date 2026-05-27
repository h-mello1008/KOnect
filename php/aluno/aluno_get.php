<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    try {
        // Buscar todos os alunos com informações via Matricula
        $stmt = $conexao->prepare("
            SELECT DISTINCT
                u.id as id,
                u.email,
                a.nome,
                a.telefone,
                a.dataNascimento,
                m.academia_id,
                ac.nome as academia_nome,
                m.modalidade_id,
                md.tipo as modalidade_tipo,
                CASE WHEN m.status_matricula = 'Ativo' THEN 1 ELSE 0 END as status_ativo
            FROM Usuario u
            INNER JOIN Aluno a ON u.id = a.id_usuario
            LEFT JOIN Matricula m ON a.id_usuario = m.aluno_id
            LEFT JOIN Academia ac ON m.academia_id = ac.id
            LEFT JOIN Modalidade md ON m.modalidade_id = md.id
            ORDER BY a.nome ASC
        ");

        $stmt->execute();
        $resultado = $stmt->get_result();

        if($resultado->num_rows > 0) {
            $dados = [];
            while($row = $resultado->fetch_assoc()) {
                $dados[] = $row;
            }
            
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Alunos carregados com sucesso',
                'data'      => $dados
            ];
        } else {
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Nenhum aluno encontrado',
                'data'      => []
            ];
        }

        $stmt->close();
    } catch (Exception $e) {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao buscar alunos: ' . $e->getMessage(),
            'data'      => []
        ];
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
