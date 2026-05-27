<?php
    if (session_status() === PHP_SESSION_NONE) session_start();
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $nome = $_POST['nome'] ?? '';
    $cpf  = $_POST['cpf']  ?? '';
    $telefone = $_POST['telefone'] ?? '';
    $redeSocial = $_POST['redeSocial'] ?? '';

    $peso = empty($_POST['peso']) ? null : (float)$_POST['peso'];
    $dataNascimento = empty($_POST['dataNascimento']) ? null : $_POST['dataNascimento'];
    $horarioPreferencial = empty($_POST['horarioPreferencial']) ? null : $_POST['horarioPreferencial'];
    $tagCor = $_POST['tagCor'] ?? '';
    $nivelCondicionamento = isset($_POST['nivelCondicionamento']) ? (int)$_POST['nivelCondicionamento'] : 5;
    $mesInicioRaw = $_POST['mesInicio'] ?? '';
    if (empty($mesInicioRaw)) {
        $mesInicio = null;
    } elseif (is_numeric($mesInicioRaw) && $mesInicioRaw >= 1 && $mesInicioRaw <= 12) {
        $mesInicio = date('Y') . '-' . str_pad((int)$mesInicioRaw, 2, '0', STR_PAD_LEFT) . '-01';
    } else {
        $mesInicio = $mesInicioRaw;
    }
    $plano = $_POST['plano'] ?? 'mensal';
    $aceitou_termos = isset($_POST['aceitou_termos']) ? (int)$_POST['aceitou_termos'] : 0;
    $atestadoMedico = isset($_POST['atestadoMedico']) ? (int)$_POST['atestadoMedico'] : 0;
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';
    $graduacao_id = ($_POST['graduacao_id'] === 'null' || empty($_POST['graduacao_id'])) ? null : (int)$_POST['graduacao_id'];
    $instrutor_id = isset($_SESSION['usuario']['id']) ? (int)$_SESSION['usuario']['id'] : (empty($_POST['instrutor_id']) ? null : (int)$_POST['instrutor_id']);

    if (empty($email) || empty($senha) || empty($nome) || empty($cpf)) {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Nome, CPF, e-mail e senha são obrigatórios.',
            'data'      => []
        ];
    } else {
        try {
            // Verificar CPF duplicado
            $stmtCpf = $conexao->prepare("SELECT id_usuario FROM Aluno WHERE cpf = ?");
            $stmtCpf->bind_param("s", $cpf);
            $stmtCpf->execute();
            $stmtCpf->store_result();
            if ($stmtCpf->num_rows > 0) {
                $stmtCpf->close();
                $conexao->close();
                $retorno = ['status' => 'nok', 'mensagem' => 'CPF já cadastrado para outro aluno.', 'data' => []];
                header("Content-type:application/json;charset:utf-8");
                echo json_encode($retorno);
                exit;
            }
            $stmtCpf->close();
            $stmt_usuario = $conexao->prepare("INSERT INTO Usuario(email, senha) VALUES(?, ?)");
            $stmt_usuario->bind_param("ss", $email, $senha);
            $stmt_usuario->execute();

            if($stmt_usuario->affected_rows > 0){
                $usuario_id = $stmt_usuario->insert_id;

                $stmt_aluno = $conexao->prepare("
                    INSERT INTO Aluno(
                        id_usuario, nome, cpf, telefone, redeSocial, peso,
                        dataNascimento, horarioPreferencial, tagCor, nivelCondicionamento,
                        mesInicio, plano, aceitou_termos, atestadoMedico, graduacao_id, instrutor_id
                    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt_aluno->bind_param(
                    "issssdsssissiiii",
                    $usuario_id, $nome, $cpf, $telefone, $redeSocial, $peso,
                    $dataNascimento, $horarioPreferencial, $tagCor, $nivelCondicionamento,
                    $mesInicio, $plano, $aceitou_termos, $atestadoMedico, $graduacao_id, $instrutor_id
                );
                $stmt_aluno->execute();

                if($stmt_aluno->affected_rows > 0){
                    // Obter academy_id do instrutor
                    $stmt_instrutor = $conexao->prepare("SELECT academia_id FROM Instrutor WHERE id_usuario = ?");
                    $stmt_instrutor->bind_param("i", $instrutor_id);
                    $stmt_instrutor->execute();
                    $res_instrutor = $stmt_instrutor->get_result()->fetch_assoc();
                    $stmt_instrutor->close();

                    $academia_id = $res_instrutor['academia_id'] ?? null;

                    // Criar matrícula automaticamente
                    if ($academia_id) {
                        $dataInicio = $mesInicio ?? date('Y-m-d');
                        $stmt_matricula = $conexao->prepare("
                            INSERT INTO Matricula(dataInicio, status_matricula, aluno_id, academia_id)
                            VALUES(?, 'Ativo', ?, ?)
                        ");
                        $stmt_matricula->bind_param("sii", $dataInicio, $usuario_id, $academia_id);
                        $stmt_matricula->execute();
                        $stmt_matricula->close();
                    }

                    $retorno = [
                        'status'    => 'ok',
                        'mensagem'  => 'Aluno registrado com sucesso!',
                        'data'      => ['usuario_id' => $usuario_id]
                    ];
                } else {
                    $retorno = ['status' => 'nok', 'mensagem' => 'Erro ao registrar os detalhes do aluno no banco.', 'data' => []];
                }
                $stmt_aluno->close();
            }
            $stmt_usuario->close();

        } catch (mysqli_sql_exception $e) {
            if ($e->getCode() == 1062) {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Este e-mail já está cadastrado no sistema. Use outro.',
                    'data'      => []
                ];
            } else {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Erro no banco de dados: ' . $e->getMessage(),
                    'data'      => []
                ];
            }
        }
    }

    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
