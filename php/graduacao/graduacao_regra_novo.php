<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $graduacao_id   = $_POST['graduacao_id'] ?? '';
    $modalidade_id  = $_POST['modalidade_id'] ?? '';
    $tempoMinimo    = $_POST['tempoMinimo'] ?? 0;
    $descricao      = $_POST['descricao'] ?? '';
    $requisitos     = $_POST['requisitos'] ?? '';
    $pontuacaoMinima = $_POST['pontuacaoMinima'] ?? 0;

    if(empty($graduacao_id) || empty($modalidade_id)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Graduação e modalidade são obrigatórias',
            'data'      => []
        ];
    } else {
        
        $stmt_check = $conexao->prepare("SELECT id FROM GraduacaoRegra WHERE graduacao_id = ? AND modalidade_id = ?");
        $stmt_check->bind_param("ii", $graduacao_id, $modalidade_id);
        $stmt_check->execute();
        
        if($stmt_check->get_result()->num_rows > 0){
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Regra já existe para essa graduação e modalidade',
                'data'      => []
            ];
        } else {
            $stmt = $conexao->prepare("
                INSERT INTO GraduacaoRegra(graduacao_id, modalidade_id, tempoMinimo, descricao, requisitos, pontuacaoMinima) 
                VALUES(?, ?, ?, ?, ?, ?)
            ");
            $stmt->bind_param("iiisis", $graduacao_id, $modalidade_id, $tempoMinimo, $descricao, $requisitos, $pontuacaoMinima);
            $stmt->execute();

            if($stmt->affected_rows > 0){
                $retorno = [
                    'status'    => 'ok',
                    'mensagem'  => 'Regra de graduação criada com sucesso',
                    'data'      => ['regra_id' => $stmt->insert_id]
                ];
            } else {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Erro ao criar regra de graduação',
                    'data'      => []
                ];
            }
            $stmt->close();
        }
        $stmt_check->close();
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
