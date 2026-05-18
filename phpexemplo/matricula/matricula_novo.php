<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $dataInicio = $_POST['dataInicio'] ?? '';
    $status_matricula = $_POST['status_matricula'] ?? 'Ativo';
    $dataVencimento = $_POST['dataVencimento'] ?? null;
    $aluno_id = $_POST['aluno_id'] ?? null;
    $modalidade_id = $_POST['modalidade_id'] ?? null;
    $academia_id = $_POST['academia_id'] ?? null;

    if(empty($dataInicio) || empty($aluno_id) || empty($modalidade_id)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Data início, aluno e modalidade são obrigatórios',
            'data'      => []
        ];
    } else {
        $status = 1;
        $stmt = $conexao->prepare("
            INSERT INTO Matricula(dataInicio, status, status_matricula, dataVencimento, aluno_id, modalidade_id, academia_id)
            VALUES(?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("ssissii", $dataInicio, $status, $status_matricula, $dataVencimento, $aluno_id, $modalidade_id, $academia_id);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Matrícula criada com sucesso',
                'data'      => ['matricula_id' => $stmt->insert_id]
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao criar matrícula',
                'data'      => []
            ];
        }
        $stmt->close();
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
