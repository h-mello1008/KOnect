<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $email  = $_POST['email'] ?? '';
    $senha  = $_POST['senha'] ?? '';

    if(empty($email) || empty($senha)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Email e senha são obrigatórios',
            'data'      => []
        ];
    } else {
        // Verificar se email já existe
        $stmt_check = $conexao->prepare("SELECT id FROM Usuario WHERE email = ?");
        $stmt_check->bind_param("s", $email);
        $stmt_check->execute();
        
        if($stmt_check->get_result()->num_rows > 0){
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Email já cadastrado',
                'data'      => []
            ];
        } else {
            $stmt = $conexao->prepare("INSERT INTO Usuario(email, senha) VALUES(?, ?)");
            $stmt->bind_param("ss", $email, $senha);
            $stmt->execute();

            if($stmt->affected_rows > 0){
                $retorno = [
                    'status'    => 'ok',
                    'mensagem'  => 'Usuário registrado com sucesso',
                    'data'      => []
                ];
            } else {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Erro ao registrar usuário',
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
