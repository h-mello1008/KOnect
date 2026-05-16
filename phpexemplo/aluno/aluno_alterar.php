<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $nome = $_POST['nome'] ?? '';
        $telefone = $_POST['telefone'] ?? '';
        $redeSocial = $_POST['redeSocial'] ?? '';
        $peso = $_POST['peso'] ?? null;
        $horarioPreferencial = $_POST['horarioPreferencial'] ?? '';
        $tagCor = $_POST['tagCor'] ?? '';
        $mesInicio = $_POST['mesInicio'] ?? '';
        $plano = $_POST['plano'] ?? '';
        $aceitou_termos = isset($_POST['aceitou_termos']) ? (int)$_POST['aceitou_termos'] : 0;
        $atestadoMedico = isset($_POST['atestadoMedico']) ? (int)$_POST['atestadoMedico'] : 0;
        $graduacao_id = $_POST['graduacao_id'] ?? null;
    
        $stmt = $conexao->prepare("
            UPDATE Aluno SET 
                nome = ?, telefone = ?, redeSocial = ?, peso = ?,
                horarioPreferencial = ?, tagCor = ?, mesInicio = ?,
                plano = ?, aceitou_termos = ?, atestadoMedico = ?, graduacao_id = ?
            WHERE id_usuario = ?
        ");
        $stmt->bind_param(
            "ssssdsssiii",
            $nome, $telefone, $redeSocial, $peso,
            $horarioPreferencial, $tagCor, $mesInicio,
            $plano, $aceitou_termos, $atestadoMedico, $graduacao_id, $_GET['id']
        );
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Aluno alterado com sucesso',
                'data'      => []
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao alterar aluno',
                'data'      => []
            ];
        }
        $stmt->close();
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID do aluno não informado',
            'data'      => []
        ];
    }
       
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
