<?php

$servidor = "localhost:3306";
$usuario  = "root";
$senha    = "";
$nome_banco = "konnect";

$conexao = new mysqli($servidor, $usuario, $senha, $nome_banco);

if($conexao->connect_error){
    echo "Erro de conexão: " . $conexao->connect_error;
}
?>
