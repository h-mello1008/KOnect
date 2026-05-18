<?php
    session_start();
    
    $retorno = [
        'status'    => 'ok',
        'mensagem'  => 'Sessão encerrada',
        'data'      => []
    ];
    
    session_destroy();
    
    header("Content-type:application/json;charset:utf-8");
    echo json_encode($retorno);
?>
