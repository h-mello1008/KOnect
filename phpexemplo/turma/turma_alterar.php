<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $nivelTecnico = $_POST['nivelTecnico'] ?? '';
        $limiteAlunos = $_POST['limiteAlunos'] ?? 0;
        $modalidade_id = $_POST['modalidade_id'] ?? null;
        $instrutor_id = $_POST['instrutor_id'] ?? null;
    
        $stmt = $conexao->prepare("
            UPDATE Turma SET 
                nivelTecnico = ?, limiteAlunos = ?,
                modalidade_id = ?, instrutor_id = ?
            WHERE codigoTurma = ?
        ");
        $stmt->bind_param("siiii", $nivelTecnico, $limiteAlunos, $modalidade_id, $instrutor_id, $_GET['id']);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Turma alterada com sucesso',
                'data'      => []
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao alterar turma',
                'data'      => []
            ];
        }
        $stmt->close();
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID da turma não informado',
            'data'      => []
        ];
    }
       
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
