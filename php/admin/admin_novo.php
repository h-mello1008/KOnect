<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $nivel_acesso = $_POST['nivel_acesso'] ?? 1;
    $academia_id = $_POST['academia_id'] ?? null;
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';

    if(empty($email) || empty($senha)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Email e senha são obrigatórios',
            'data'      => []
        ];
    } else {
        session_start();

        $stmt_usuario = $conexao->prepare("INSERT INTO Usuario(email, senha) VALUES(?, ?)");
        $stmt_usuario->bind_param("ss", $email, $senha);
        $stmt_usuario->execute();

        if($stmt_usuario->affected_rows > 0){
            $usuario_id = $stmt_usuario->insert_id;

            $stmt_admin = $conexao->prepare("
                INSERT INTO Admin(id_usuario, nivel_acesso, academia_id)
                VALUES(?, ?, ?)
            ");

            $stmt_admin->bind_param("iii", $usuario_id, $nivel_acesso, $academia_id);
            $stmt_admin->execute();

            if($stmt_admin->affected_rows > 0){
                $_SESSION['usuario'] = [
                    'id' => $usuario_id,
                    'email' => $email,
                    'tipo' => 'admin'
                ];

                $retorno = [
                    'status'    => 'ok',
                    'mensagem'  => 'Admin registrado com sucesso',
                    'data'      => ['usuario_id' => $usuario_id]
                ];
            } else {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Erro ao registrar admin',
                    'data'      => []
                ];
            }
            $stmt_admin->close();
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Erro ao criar usuário',
                'data'      => []
            ];
        }
        $stmt_usuario->close();
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
