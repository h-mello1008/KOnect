<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $nivelTecnico = $_POST['nivelTecnico'] ?? '';
    $limiteAlunos = $_POST['limiteAlunos'] ?? 0;
    $modalidade_id = $_POST['modalidade_id'] ?? null;
    $instrutor_id = $_POST['instrutor_id'] ?? null;

    if(empty($nivelTecnico) || empty($modalidade_id) || empty($instrutor_id)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nível técnico, modalidade e instrutor são obrigatórios',
            'data'      => []
        ];
    } else {
        $stmt = $conexao->prepare("
            INSERT INTO Turma(nivelTecnico, limiteAlunos, modalidade_id, instrutor_id)
            VALUES(?, ?, ?, ?)
        ");
        $stmt->bind_param("sii", $nivelTecnico, $limiteAlunos, $modalidade_id, $instrutor_id);
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Turma criada com sucesso',
                'data'      => ['turma_id' => $stmt->insert_id]
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao criar turma',
                'data'      => []
            ];
        }
        $stmt->close();
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
