<?php
    session_start();
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_SESSION['usuario']['id'])) {
        $id_usuario = (int)$_SESSION['usuario']['id'];

        $sql = "
            SELECT 
                f.dataPresenca, 
                f.presenca, 
                f.justificativa, 
                a.conteudoTreinado AS conteudo_treinado 
            FROM Frequencia f
            LEFT JOIN Aula a ON f.aula_id = a.id
            WHERE f.aluno_id = ?
            ORDER BY f.dataPresenca DESC
            LIMIT 30
        ";

        $stmt = $conexao->prepare($sql);
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        $tabela = [];
        if($resultado->num_rows > 0) {
            while($linha = $resultado->fetch_assoc()) {
                $tabela[] = $linha;
            }
            
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Histórico recuperado com sucesso.',
                'data'      => $tabela
            ];
        } else {
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Nenhum registro encontrado.',
                'data'      => []
            ];
        }
        $stmt->close();

    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Acesso negado. Sessão expirada.',
            'data'      => []
        ];
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>