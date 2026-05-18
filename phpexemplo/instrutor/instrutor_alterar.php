<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $nome = $_POST['nome'] ?? '';
        $telefone = $_POST['telefone_responsavel'] ?? '';
        $cpf = $_POST['cpf'] ?? '';
        $dataNascimento = $_POST['dataNascimento'] ?? '';
        $nome_fantasia = $_POST['nome_fantasia'] ?? '';
        $razao_social = $_POST['razao_social'] ?? '';
        $cnpj = $_POST['cnpj'] ?? '';
        $horario_abertura = $_POST['horario_abertura'] ?? '';
        $horario_fechamento = $_POST['horario_fechamento'] ?? '';
        $periodo_contrato = $_POST['periodo_contrato'] ?? '';
        $aceitou_termos = isset($_POST['aceitou_termos']) ? (int)$_POST['aceitou_termos'] : 0;
        $academia_id = $_POST['academia_id'] ?? null;
    
        $stmt = $conexao->prepare("
            UPDATE Instrutor SET 
                nome = ?, telefone_responsavel = ?, cpf = ?, dataNascimento = ?,
                nome_fantasia = ?, razao_social = ?, cnpj = ?, horario_abertura = ?,
                horario_fechamento = ?, periodo_contrato = ?, aceitou_termos = ?, academia_id = ?
            WHERE id_usuario = ?
        ");
        $stmt->bind_param(
            "ssssssssssiii",
            $nome, $telefone, $cpf, $dataNascimento,
            $nome_fantasia, $razao_social, $cnpj, $horario_abertura,
            $horario_fechamento, $periodo_contrato, $aceitou_termos, $academia_id, $_GET['id']
        );
        $stmt->execute();

        if($stmt->affected_rows > 0){
            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Instrutor alterado com sucesso',
                'data'      => []
            ];
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao alterar instrutor',
                'data'      => []
            ];
        }
        $stmt->close();
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID do instrutor não informado',
            'data'      => []
        ];
    }
       
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
