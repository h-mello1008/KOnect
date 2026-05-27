<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    try {
        $stmt = $conexao->prepare("
            SELECT DISTINCT
                u.id        AS id,
                u.email,
                a.nome,
                a.telefone,
                a.dataNascimento,
                m.academia_id,
                ac.nome     AS academia_nome,
                CASE WHEN m.status_matricula = 'Ativo' THEN 1 ELSE 0 END AS status_ativo
            FROM Usuario u
            INNER JOIN Aluno a  ON u.id        = a.id_usuario
            LEFT  JOIN Matricula m  ON a.id_usuario = m.aluno_id
            LEFT  JOIN Academia  ac ON m.academia_id = ac.id
            ORDER BY a.nome ASC
        ");

        $stmt->execute();
        $resultado = $stmt->get_result();

        $dados = [];
        while ($row = $resultado->fetch_assoc()) {
            $dados[] = $row;
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => count($dados) > 0 ? 'Alunos carregados com sucesso' : 'Nenhum aluno encontrado',
            'data'      => $dados
        ];

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
