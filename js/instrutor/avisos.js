document.addEventListener('DOMContentLoaded', carregarAvisos);

document.getElementById('formNovoAviso').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const btnSubmit = form.querySelector('button[type="submit"]');

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Publicando...';

    try {
        const response = await fetch('/KOnect/KOnect/php/instrutor/aviso_novo.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            form.reset();
            adicionarAvisoNaTela(resultado.data.titulo, resultado.data.mensagem, resultado.data.data_criacao);
        } else {
            alert('Erro ao publicar: ' + resultado.mensagem);
        }
    } catch (erro) {
        alert('Erro de conexão ao publicar aviso.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Publicar Aviso';
    }
});

async function carregarAvisos() {
    const lista = document.getElementById('listaDeAvisos');
    try {
        const response = await fetch('/KOnect/KOnect/php/instrutor/avisos_get.php', { credentials: 'include' });
        const resultado = await response.json();

        if (resultado.status === 'ok' && resultado.data.length > 0) {
            lista.innerHTML = '';
            resultado.data.forEach(aviso => {
                adicionarAvisoNaTela(aviso.titulo, aviso.mensagem, aviso.data_criacao);
            });
        } else {
            lista.innerHTML = '<p class="text-muted small mb-0">Nenhum aviso publicado recentemente.</p>';
        }
    } catch (erro) {
        lista.innerHTML = '<p class="text-muted small mb-0">Nenhum aviso publicado recentemente.</p>';
    }
}

function adicionarAvisoNaTela(titulo, mensagem, dataCriacao) {
    const lista = document.getElementById('listaDeAvisos');

    if (lista.innerHTML.includes('Nenhum aviso')) {
        lista.innerHTML = '';
    }

    const dataFormatada = dataCriacao
        ? new Date(dataCriacao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Agora mesmo';

    const divAviso = document.createElement('div');
    divAviso.className = 'aviso-item';
    divAviso.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-1">
            <strong class="text-white">${titulo}</strong>
            <span class="small text-muted">${dataFormatada}</span>
        </div>
        <p class="small text-muted mb-0">${mensagem}</p>
    `;

    lista.prepend(divAviso);
}
