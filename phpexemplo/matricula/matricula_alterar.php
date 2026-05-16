<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $dataInicio = $_POST['dataInicio'] ?? '';
        $status_matricula = $_POST['status_matricula'] ?? 'Ativo';
        $dataVencimento = $_POST['dataVencimento'] ?? null;
        $modalidade_id = $_POST['modalidade_id'] ?? null;
        $academia_id = $_POST['academia_id'] ?? null;
    
        $stmt = $conexao->prepare("
            UPDATE Matricula SET 
                dataInicio = ?, status_matricula = ?,
                dataVencimento = ?, modalidade_id = ?, academia_id = ?
            WHERE id = ?
        ");
        $stmt->bind_param("sssiiii", $dataInicio, $status_matricula, $dataVencimento, $modalidade_id, $academia_id, $_GET['id']);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Matrícula alterada com sucesso',
                'data'      => []
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao alterar matrícula',
                'data'      => []
            ];
        }
        $stmt->close();
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID da matrícula não informado',
            'data'      => []
        ];
    }
       
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
