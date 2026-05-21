<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['academia_id'])){
        // Obter fluxo de caixa de uma academia específica
        $stmt = $conexao->prepare("
            SELECT 
                m.id,
                m.valor,
                m.dataLancamento,
                m.mes_referencia,
                m.dataVencimento,
                m.status_pagamento,
                m.data_pagamento,
                a.id as aluno_id,
                u.email as aluno_email,
                al.nome as aluno_nome,
                mat.id as matricula_id,
                mod.tipo as modalidade_tipo,
                ac.nome as academia_nome
            FROM Mensalidade m
            JOIN Matricula mat ON m.matricula_id = mat.id
            JOIN Aluno al ON mat.aluno_id = al.id_usuario
            JOIN Usuario u ON al.id_usuario = u.id
            JOIN Modalidade mod ON mat.modalidade_id = mod.id
            JOIN Academia ac ON m.academia_id = ac.id
            WHERE m.academia_id = ?
            ORDER BY m.dataVencimento DESC
        ");
        $stmt->bind_param("i", $_GET['academia_id']);
    } elseif(isset($_GET['id'])){
        // Obter uma mensalidade específica
        $stmt = $conexao->prepare("
            SELECT 
                m.id,
                m.valor,
                m.dataLancamento,
                m.mes_referencia,
                m.dataVencimento,
                m.status_pagamento,
                m.data_pagamento,
                a.id as aluno_id,
                u.email as aluno_email,
                al.nome as aluno_nome,
                mat.id as matricula_id,
                mod.tipo as modalidade_tipo,
                ac.nome as academia_nome
            FROM Mensalidade m
            JOIN Matricula mat ON m.matricula_id = mat.id
            JOIN Aluno al ON mat.aluno_id = al.id_usuario
            JOIN Usuario u ON al.id_usuario = u.id
            JOIN Modalidade mod ON mat.modalidade_id = mod.id
            JOIN Academia ac ON m.academia_id = ac.id
            WHERE m.id = ?
        ");
        $stmt->bind_param("i", $_GET['id']);
    } else {
        // Obter todas as mensalidades
        $stmt = $conexao->prepare("
            SELECT 
                m.id,
                m.valor,
                m.dataLancamento,
                m.mes_referencia,
                m.dataVencimento,
                m.status_pagamento,
                m.data_pagamento,
                a.id as aluno_id,
                u.email as aluno_email,
                al.nome as aluno_nome,
                mat.id as matricula_id,
                mod.tipo as modalidade_tipo,
                ac.nome as academia_nome
            FROM Mensalidade m
            JOIN Matricula mat ON m.matricula_id = mat.id
            JOIN Aluno al ON mat.aluno_id = al.id_usuario
            JOIN Usuario u ON al.id_usuario = u.id
            JOIN Modalidade mod ON mat.modalidade_id = mod.id
            JOIN Academia ac ON m.academia_id = ac.id
            ORDER BY m.dataVencimento DESC
        ");
    }
    
    $stmt->execute();
    $resultado = $stmt->get_result();
    $tabela = [];
    
    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Consulta realizada com sucesso',
            'data'      => $tabela
        ];
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nenhuma mensalidade encontrada',
            'data'      => []
        ];
    }
    
    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
