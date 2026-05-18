<?php
    include_once('../conexao.php');
    
    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $email   = $_POST['email'] ?? '';
    $senha   = $_POST['senha'] ?? '';

    if(empty($email) || empty($senha)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Email e senha são obrigatórios',
            'data'      => []
        ];
    } else {
        $stmt = $conexao->prepare("SELECT id, email FROM Usuario WHERE email = ? AND senha = ?");
        $stmt->bind_param("ss", $email, $senha);
        
        $stmt->execute();
        $resultado = $stmt->get_result();
        $tabela = [];
        
        if($resultado->num_rows > 0){
            while($linha = $resultado->fetch_assoc()){
                $tabela[] = $linha;
            }

            session_start();
            $_SESSION['usuario'] = $tabela[0];

            $retorno = [
                'status'    => 'ok',
                'mensagem'  => 'Login realizado com sucesso',
                'data'      => $tabela[0]
            ];
        }else{
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Email ou senha inválidos',
                'data'      => []
            ];
        }
        
        $stmt->close();
    }
    
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
