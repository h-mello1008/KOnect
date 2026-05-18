<?php
    include_once('../conexao.php');

    $retorno = [
        'status'    => '',
        'mensagem'  => '',
        'data'      => []
    ];

    if(isset($_GET['id'])){
        $id_usuario = (int)$_GET['id'];
        
        $campos_permitidos = [
            'nome', 'telefone', 'redeSocial', 'peso', 
            'horarioPreferencial', 'tagCor', 'mesInicio', 
            'plano', 'aceitou_termos', 'atestadoMedico', 
            'graduacao_id', 'status', 'nivelCondicionamento'
        ];
        
        $query_parts = [];
        $tipos_bind = "";
        $valores = [];

        foreach($campos_permitidos as $campo){
            if(isset($_POST[$campo])){
                $query_parts[] = "$campo = ?";
                $valores[] = $_POST[$campo];

                if($campo === 'peso') {
                    $tipos_bind .= "d"; // double
                } elseif(in_array($campo, ['aceitou_termos', 'atestadoMedico', 'graduacao_id', 'nivelCondicionamento'])) {
                    $tipos_bind .= "i"; // int (inteiro)
                } else {
                    $tipos_bind .= "s"; // string (texto)
                }
            }
        }

        if(count($query_parts) > 0){
            $sql = "UPDATE Aluno SET " . implode(", ", $query_parts) . " WHERE id_usuario = ?";
            $tipos_bind .= "i"; // Adiciona o tipo do ID no final
            $valores[] = $id_usuario; // Adiciona o ID no array de valores

            $stmt = $conexao->prepare($sql);
            
            // O operador ... (splat) desempacota o array para o bind_param dinâmico (Requer PHP 5.6+)
            $stmt->bind_param($tipos_bind, ...$valores);
            $stmt->execute();

            if($stmt->errno === 0){ // Garante que foi sucesso, mesmo se nenhum dado for alterado na prática
                $retorno = [
                    'status'    => 'ok',
                    'mensagem'  => 'Perfil atualizado com sucesso!',
                    'data'      => []
                ];
            } else {
                $retorno = [
                    'status'    => 'nok',
                    'mensagem'  => 'Erro ao atualizar na base de dados.',
                    'data'      => []
                ];
            }
            $stmt->close();
        } else {
            $retorno = [
                'status'    => 'nok',
                'mensagem'  => 'Nenhum dado enviado para ser alterado.',
                'data'      => []
            ];
        }
    } else {
        $retorno = [
            'status'    => 'nok',
            'mensagem'  => 'ID do aluno não informado.',
            'data'      => []
        ];
    }
       
    $conexao->close();

    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>