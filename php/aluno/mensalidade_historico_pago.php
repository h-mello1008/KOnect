<?php
    session_start();
    include_once(__DIR__ . '/../conexao.php');
    
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    // Verificar se o usuário está logado
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

    // Query para buscar mensalidades pagas do aluno
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
            DATEDIFF(m.data_pagamento, m.dataVencimento) as dias_antecipacao
        FROM Mensalidade m
        INNER JOIN Matricula mat ON m.matricula_id = mat.id
        INNER JOIN Academia a ON m.academia_id = a.id
        INNER JOIN Modalidade modalidade ON mat.modalidade_id = modalidade.id
        WHERE mat.aluno_id = ? AND m.status_pagamento = 'Pago'
        ORDER BY m.data_pagamento DESC
    ";

    $stmt = $conexao->prepare($query);
    $stmt->bind_param("i", $usuario_id);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $mensalidades = [];
    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            // Converter valores para tipo apropriado
            $linha['valor'] = (float)$linha['valor'];
            $linha['dias_antecipacao'] = (int)$linha['dias_antecipacao'];
            
            // Calcular se foi pago antecipadamente
            if($linha['dias_antecipacao'] < 0){
                $linha['dias_antecipacao_display'] = abs($linha['dias_antecipacao']) . ' dias antes';
            } else if($linha['dias_antecipacao'] > 0){
                $linha['dias_antecipacao_display'] = $linha['dias_antecipacao'] . ' dias após o vencimento';
            } else {
                $linha['dias_antecipacao_display'] = 'No dia do vencimento';
            }
            
            $mensalidades[] = $linha;
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Histórico de pagamentos encontrado',
            'data'      => $mensalidades
        ];
    } else {
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Nenhum pagamento realizado',
            'data'      => []
        ];
    }

    $stmt->close();

    header("Content-type: application/json; charset: utf-8;");
    echo json_encode($retorno);
?>
