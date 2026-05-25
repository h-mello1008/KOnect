<?php
// Variáveis de conexão com o Banco de Dados
$servidor = "localhost:3306";// Caso façam com o ip : 127.0.0.1
$usuario  = "root";
$senha    = "";
$nome_banco = "konnect";

$conexao = new mysqli($servidor, $usuario, $senha, $nome_banco);

if($conexao->connect_error){
    echo "Erro de conexão: " . $conexao->connect_error;
}
?>