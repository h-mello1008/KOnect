document.getElementById('formNovoAviso').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const form = e.target;
    const formData = new FormData(form);

    try {
        
        const response = await fetch('/KOnect/php/instrutor/aviso_novo.php', {
            method: 'POST',
            body: formData
        });

        
        
        

        
        const resultado = { status: 'ok' }; 

        if (resultado.status === 'ok') {
            alert("Aviso publicado com sucesso no mural dos alunos!");
            
            
            adicionarAvisoNaTela(
                form.querySelector('[name="titulo"]').value, 
                form.querySelector('[name="mensagem"]').value
            );
            
            form.reset(); 
        } else {
            alert('Erro ao publicar: ' + resultado.mensagem);
        }
    } catch (erro) {
        alert('O arquivo PHP ainda não foi configurado. O aviso aparecerá visualmente para teste.');
        
        
        adicionarAvisoNaTela(
            form.querySelector('[name="titulo"]').value, 
            form.querySelector('[name="mensagem"]').value
        );
        form.reset();
    }
});

function adicionarAvisoNaTela(titulo, mensagem) {
    const lista = document.getElementById('listaDeAvisos');
    
    
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
    
    
    lista.prepend(divAviso);
}
