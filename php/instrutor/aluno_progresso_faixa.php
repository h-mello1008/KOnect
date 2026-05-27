<?php
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $id_usuario = (int)$_GET['id'];

        $sql_atual = "
            SELECT
                a.nome,
                g.id AS id_faixa,
                g.corFaixa AS faixa_atual,
                g.hierarquia,
                (SELECT COUNT(*) FROM Frequencia f WHERE f.aluno_id = a.id_usuario AND f.presenca = 1) AS presencas_totais
            FROM Aluno a
            LEFT JOIN Graduacao g ON a.graduacao_id = g.id
            WHERE a.id_usuario = ?
        ";

        $stmt = $conexao->prepare($sql_atual);

        if(!$stmt) {
            die("Erro fatal no SQL Atual: " . $conexao->error);
        }

        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if($resultado->num_rows > 0){
            $dados_aluno = $resultado->fetch_assoc();
            $hierarquia_atual = (int)$dados_aluno['hierarquia'];
            $presencas = (int)$dados_aluno['presencas_totais'];

            $sql_proxima = "SELECT corFaixa, tempoMinimo FROM Graduacao WHERE CAST(hierarquia AS UNSIGNED) > ? ORDER BY CAST(hierarquia AS UNSIGNED) ASC LIMIT 1";
            $stmt_prox = $conexao->prepare($sql_proxima);

            if(!$stmt_prox) {
                die("Erro fatal no SQL Próxima: " . $conexao->error);
            }

            $stmt_prox->bind_param("i", $hierarquia_atual);
            $stmt_prox->execute();
            $resultado_prox = $stmt_prox->get_result();

            $proxima_faixa = null;
            $meta_aulas = 0;

            if($resultado_prox->num_rows > 0){
                $dados_prox = $resultado_prox->fetch_assoc();
                $proxima_faixa = $dados_prox['corFaixa'];
                $meta_aulas = (int)$dados_prox['tempoMinimo'] * 8;
                if($meta_aulas == 0) $meta_aulas = 24;
            }

            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Progresso calculado.',
                'data'      => [
                    'nome'              => $dados_aluno['nome'],
                    'faixa_atual'       => $dados_aluno['faixa_atual'] ?? 'Sem Faixa',
                    'presencas'         => $presencas,
                    'proxima_faixa'     => $proxima_faixa,
                    'meta_aulas'        => $meta_aulas
                ]
            ];
            $stmt_prox->close();
        } else {
            $retorno = ['status' => 'nok', 'mensagem' => 'Aluno não encontrado.', 'data' => []];
        }
        $stmt->close();
    } else {
        $retorno = ['status' => 'nok', 'mensagem' => 'ID não fornecido.', 'data' => []];
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");

    $json = json_encode($retorno);
    if($json === false) {
        echo json_encode(['status' => 'nok', 'mensagem' => 'Erro interno de conversão JSON']);
    } else {
        echo $json;
    }
?>
