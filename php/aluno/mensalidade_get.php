<?php
    session_start();
    include_once('../conexao.php');
    
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    
    if(!isset($_SESSION['usuario'])){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Usuário não autenticado',
            'data'      => []
        ];
        header("Content-type: application/json; charset: utf-8;");
        echo json_encode($retorno);
        exit;
    }

    $usuario_id = $_SESSION['usuario']['id'];

    
    $query = "
        SELECT 
            m.id,
            m.valor,
            m.dataLancamento,
            m.mes_referencia,
            m.dataVencimento,
            m.status_pagamento,
            m.data_pagamento,
            a.nome as academia_nome,
            modalidade.tipo as modalidade_tipo,
            DATEDIFF(CURDATE(), m.dataVencimento) as dias_vencimento
        FROM Mensalidade m
        INNER JOIN Matricula mat ON m.matricula_id = mat.id
        INNER JOIN Academia a ON m.academia_id = a.id
        INNER JOIN Modalidade modalidade ON mat.modalidade_id = modalidade.id
        WHERE mat.aluno_id = ?
        ORDER BY m.dataVencimento DESC
    ";

    $stmt = $conexao->prepare($query);
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $mensalidades = [];
    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            
            $linha['valor'] = (float)$linha['valor'];
            $linha['dias_vencimento'] = (int)$linha['dias_vencimento'];
            
            
            if($linha['status_pagamento'] === 'Pendente'){
                if($linha['dias_vencimento'] > 0){
                    $linha['status_pagamento'] = 'Vencido';
                }
            }
            
            
            if($linha['dias_vencimento'] > 0){
                $linha['dias_atraso'] = $linha['dias_vencimento'];
                $linha['status_display'] = 'Vencido';
            } else if($linha['dias_vencimento'] < 0){
                $linha['dias_restantes'] = abs($linha['dias_vencimento']);
                $linha['status_display'] = 'Pendente';
            } else {
                $linha['status_display'] = 'Vence hoje!';
            }
            
            $mensalidades[] = $linha;
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Mensalidades encontradas',
            'data'      => $mensalidades
        ];
    } else {
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Nenhuma mensalidade encontrada',
            'data'      => []
        ];
    }

    $stmt->close();

    header("Content-type: application/json; charset: utf-8;");
    echo json_encode($retorno);
?>
