// Padrão limpo usando event listener e FormData, igual ao cadastro_aluno.js
document.getElementById('formNovoAviso').addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    
    const form = e.target;
    const formData = new FormData(form);

    try {
        // Envia para um futuro PHP que salvará o aviso no banco de dados
        const response = await fetch('/KOnect/php/instrutor/aviso_novo.php', {
            method: 'POST',
            body: formData
        });

        // Caso o PHP ainda não exista, isso dará erro de JSON. 
        // Descomente a linha abaixo quando o PHP estiver pronto.
        // const resultado = await response.json(); 

        // Simulação de sucesso para a prova de autoria (enquanto o PHP não for criado):
        const resultado = { status: 'ok' }; 

        if (resultado.status === 'ok') {
            alert("Aviso publicado com sucesso no mural dos alunos!");
            
            // Injeta o aviso na tela sem recarregar a página
            adicionarAvisoNaTela(
                form.querySelector('[name="titulo"]').value, 
                form.querySelector('[name="mensagem"]').value
            );
            
            form.reset(); // Limpa os campos do formulário
        } else {
            alert('Erro ao publicar: ' + resultado.mensagem);
        }
    } catch (erro) {
        alert('O arquivo PHP ainda não foi configurado. O aviso aparecerá visualmente para teste.');
        
        // Mantém a funcionalidade visual para a apresentação
        adicionarAvisoNaTela(
            form.querySelector('[name="titulo"]').value, 
            form.querySelector('[name="mensagem"]').value
        );
        form.reset();
    }
});

// Função separada para manter o HTML longe da lógica de submissão
function adicionarAvisoNaTela(titulo, mensagem) {
    const lista = document.getElementById('listaDeAvisos');
    
    // Se for o primeiro aviso, tira a mensagem de "Nenhum aviso"
    if (lista.innerHTML.includes('Nenhum aviso publicado')) {
        lista.innerHTML = '';
    }

    const divAviso = document.createElement('div');
    divAviso.className = 'aviso-item';
    divAviso.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-1">
            <strong class="text-white">${titulo}</strong>
            <span class="small text-muted">Agora mesmo</span>
        </div>
        <p class="small text-muted mb-0">${mensagem}</p>
    `;
    
    // Adiciona o novo aviso no topo da lista
    lista.prepend(divAviso);
}