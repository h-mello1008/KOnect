<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $stmt = $conexao->prepare("SELECT * FROM Modalidade WHERE id = ?");
        $stmt->bind_param("i", $_GET['id']);
    } elseif(isset($_GET['academia_id'])){
        $stmt = $conexao->prepare("SELECT * FROM Modalidade WHERE academia_id = ? ORDER BY tipo");
        $stmt->bind_param("i", $_GET['academia_id']);
    } else {
        $stmt = $conexao->prepare("SELECT * FROM Modalidade ORDER BY tipo");
    }
    
    $stmt->execute();
    $resultado = $stmt->get_result();
    $tabela = [];
    
    if($resultado->num_rows > 0){
        while($linha = $resultado->fetch_assoc()){
            $tabela[] = $linha;
        }

        $retorno = [
            'status'    => 'ok',
            'mensagem'  => 'Consulta realizada com sucesso',
            'data'      => $tabela
        ];
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nenhuma modalidade encontrada',
            'data'      => []
        ];
    }
    
    $stmt->close();
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
