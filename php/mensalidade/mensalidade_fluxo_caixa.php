<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['academia_id'])){
        // Obter estatísticas de fluxo de caixa de uma academia
        $stmt = $conexao->prepare("
            SELECT 
                COUNT(*) as total_mensalidades,
                SUM(CASE WHEN status_pagamento = 'Pago' THEN valor ELSE 0 END) as valor_pago,
                SUM(CASE WHEN status_pagamento = 'Pendente' THEN valor ELSE 0 END) as valor_pendente,
                SUM(CASE WHEN status_pagamento = 'Vencido' THEN valor ELSE 0 END) as valor_vencido,
                SUM(valor) as valor_total,
                COUNT(CASE WHEN status_pagamento = 'Pago' THEN 1 END) as qtd_pagas,
                COUNT(CASE WHEN status_pagamento = 'Pendente' THEN 1 END) as qtd_pendentes,
                COUNT(CASE WHEN status_pagamento = 'Vencido' THEN 1 END) as qtd_vencidas
            FROM Mensalidade 
            WHERE academia_id = ?
        ");
        $stmt->bind_param("i", $_GET['academia_id']);
    } else {
        // Obter estatísticas gerais
        $stmt = $conexao->prepare("
            SELECT 
                COUNT(*) as total_mensalidades,
                SUM(CASE WHEN status_pagamento = 'Pago' THEN valor ELSE 0 END) as valor_pago,
                SUM(CASE WHEN status_pagamento = 'Pendente' THEN valor ELSE 0 END) as valor_pendente,
                SUM(CASE WHEN status_pagamento = 'Vencido' THEN valor ELSE 0 END) as valor_vencido,
                SUM(valor) as valor_total,
                COUNT(CASE WHEN status_pagamento = 'Pago' THEN 1 END) as qtd_pagas,
                COUNT(CASE WHEN status_pagamento = 'Pendente' THEN 1 END) as qtd_pendentes,
                COUNT(CASE WHEN status_pagamento = 'Vencido' THEN 1 END) as qtd_vencidas
            FROM Mensalidade
        ");
    }
    
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if($resultado->num_rows > 0){
        $dados = $resultado->fetch_assoc();
        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Estatísticas de fluxo de caixa',
            'data'      => [$dados]
        ];
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Erro ao obter estatísticas',
            'data'      => []
        ];
    }
    
    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
