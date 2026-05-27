<?php
    if (session_status() === PHP_SESSION_NONE) session_start();
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    $nome = $_POST['nome'] ?? '';
    $telefone = $_POST['telefone'] ?? '';
    $redeSocial = $_POST['redeSocial'] ?? '';

    $peso = empty($_POST['peso']) ? null : (float)$_POST['peso'];
    $dataNascimento = empty($_POST['dataNascimento']) ? null : $_POST['dataNascimento'];
    $horarioPreferencial = empty($_POST['horarioPreferencial']) ? null : $_POST['horarioPreferencial'];
    $tagCor = $_POST['tagCor'] ?? '';
    $nivelCondicionamento = isset($_POST['nivelCondicionamento']) ? (int)$_POST['nivelCondicionamento'] : 5;
    $mesInicio = empty($_POST['mesInicio']) ? null : $_POST['mesInicio'];
    $plano = $_POST['plano'] ?? 'mensal';
    $aceitou_termos = isset($_POST['aceitou_termos']) ? (int)$_POST['aceitou_termos'] : 0;
    $atestadoMedico = isset($_POST['atestadoMedico']) ? (int)$_POST['atestadoMedico'] : 0;
    $email = $_POST['email'] ?? '';
    $senha = $_POST['senha'] ?? '';
    $graduacao_id = ($_POST['graduacao_id'] === 'null' || empty($_POST['graduacao_id'])) ? null : (int)$_POST['graduacao_id'];
    $instrutor_id = isset($_SESSION['usuario']['id']) ? (int)$_SESSION['usuario']['id'] : (empty($_POST['instrutor_id']) ? null : (int)$_POST['instrutor_id']);

    if(empty($email) || empty($senha) || empty($nome)){
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'Email, senha e nome são obrigatórios',
            'data'      => []
        ];
    } else {
        try {
            $stmt_usuario = $conexao->prepare("INSERT INTO Usuario(email, senha) VALUES(?, ?)");
            $stmt_usuario->bind_param("ss", $email, $senha);
            $stmt_usuario->execute();

            if($stmt_usuario->affected_rows > 0){
                $usuario_id = $stmt_usuario->insert_id;

                $stmt_aluno = $conexao->prepare("
                    INSERT INTO Aluno(
                        id_usuario, nome, telefone, redeSocial, peso,
                        dataNascimento, horarioPreferencial, tagCor, nivelCondicionamento,
                        mesInicio, plano, aceitou_termos, atestadoMedico, graduacao_id, instrutor_id
                    ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt_aluno->bind_param(
                    "isssdsssissiiii",
                    $usuario_id, $nome, $telefone, $redeSocial, $peso,
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
