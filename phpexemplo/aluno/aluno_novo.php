<?php
    include_once('../../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

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
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';
    $graduacao_id = $_POST['graduacao_id'] ?? null;

    if(empty($email) || empty($senha) || empty($nome)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Email, senha e nome são obrigatórios',
            'data'      => []
        ];
    } else {
        session_start();
        
        // Inserir usuário base
        $stmt_usuario = $conexao->prepare("INSERT INTO Usuario(email, senha) VALUES(?, ?)");
        $stmt_usuario->bind_param("ss", $email, $senha);
        $stmt_usuario->execute();

        if($stmt_usuario->affected_rows > 0){
            $usuario_id = $stmt_usuario->insert_id;

            // Inserir aluno
            $stmt_aluno = $conexao->prepare("
                INSERT INTO Aluno(
                    id_usuario, nome, telefone, redeSocial, peso,
                    horarioPreferencial, tagCor, mesInicio, plano,
                    aceitou_termos, atestadoMedico, graduacao_id
                ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt_aluno->bind_param(
                "isssdsssiii",
                $usuario_id, $nome, $telefone, $redeSocial, $peso,
                $horarioPreferencial, $tagCor, $mesInicio, $plano,
                $aceitou_termos, $atestadoMedico, $graduacao_id
            );
            $stmt_aluno->execute();

            if($stmt_aluno->affected_rows > 0){
                $_SESSION['usuario'] = [
                    'id' => $usuario_id,
                    'email' => $email,
                    'tipo' => 'aluno'
                ];

                $retorno = [
                    'status'    => 'ok',
                    'mensagem'  => 'Aluno registrado com sucesso',
                    'data'      => ['usuario_id' => $usuario_id]
                ];
            } else {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Erro ao registrar aluno',
                    'data'      => []
                ];
            }
            $stmt_aluno->close();
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
