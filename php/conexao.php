<?php
// Variáveis de conexão com o Banco de Dados
$servidor = "127.0.0.1"; // Usem localhost:3306 (no meu contexto precisei utilizar o IP pra funcionar)
$usuario  = "root";
$senha    = "";
$nome_banco = "konnect";

// O driver mysqli já sabe que deve procurar a porta 3306 por padrão
$conexao = new mysqli($servidor, $usuario, $senha, $nome_banco);

if($conexao->connect_error){
    echo "Erro de conexão: " . $conexao->connect_error;
}
?>