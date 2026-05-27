document.addEventListener('DOMContentLoaded', () => {
    carregarAvisos();

    const form = document.getElementById('formNovoAviso');
    const btnCancelar = document.getElementById('btnCancelarEdicaoAviso');

    form.addEventListener('submit', salvarAviso);
    btnCancelar.addEventListener('click', resetarFormularioAviso);
});

async function salvarAviso(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const avisoId = formData.get('id');
    const btnSubmit = document.getElementById('btnSalvarAviso');
    const url = avisoId ? '../../php/instrutor/aviso_alterar.php' : '../../php/instrutor/aviso_novo.php';

    btnSubmit.disabled = true;
    btnSubmit.textContent = avisoId ? 'Salvando...' : 'Publicando...';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            resetarFormularioAviso();
            await carregarAvisos();
        } else {
            alert('Erro ao salvar: ' + resultado.mensagem);
        }
    } catch (erro) {
        alert('Erro de conexão ao salvar aviso.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = document.getElementById('avisoId').value ? 'Salvar Aviso' : 'Publicar Aviso';
    }
}

async function carregarAvisos() {
    const lista = document.getElementById('listaDeAvisos');
    try {
        const response = await fetch('/KOnect/php/instrutor/avisos_get.php', { credentials: 'include' });
        const resultado = await response.json();

        if (resultado.status === 'ok' && resultado.data.length > 0) {
            lista.innerHTML = '';
            resultado.data.forEach(aviso => {
                adicionarAvisoNaTela(aviso);
            });
        } else {
            lista.innerHTML = '<p class="text-muted small mb-0">Nenhum aviso publicado recentemente.</p>';
        }
    } catch (erro) {
        lista.innerHTML = '<p class="text-muted small mb-0">Nenhum aviso publicado recentemente.</p>';
    }
}

function adicionarAvisoNaTela(aviso) {
    const lista = document.getElementById('listaDeAvisos');

    if (lista.innerHTML.includes('Nenhum aviso')) {
        lista.innerHTML = '';
    }

    const dataFormatada = aviso.data_criacao
        ? new Date(aviso.data_criacao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Agora mesmo';

    const divAviso = document.createElement('div');
    divAviso.className = 'aviso-item';
    divAviso.innerHTML = `
        <div class="d-flex justify-content-between align-items-start gap-3 mb-1">
            <div>
                <strong class="text-white d-block">${escapeHtml(aviso.titulo)}</strong>
                <span class="small text-muted">${dataFormatada}</span>
            </div>
            <div class="d-flex gap-1">
                <button type="button" class="btn btn-sm btn-outline-light btn-editar-aviso" title="Editar aviso">
                    <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger btn-excluir-aviso" title="Excluir aviso">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
        <p class="small text-muted mb-0">${escapeHtml(aviso.mensagem)}</p>
    `;

    divAviso.querySelector('.btn-editar-aviso').addEventListener('click', () => editarAviso(aviso));
    divAviso.querySelector('.btn-excluir-aviso').addEventListener('click', () => excluirAviso(aviso.id));

    lista.appendChild(divAviso);
}

function editarAviso(aviso) {
    const form = document.getElementById('formNovoAviso');

    form.elements.id.value = aviso.id;
    form.elements.titulo.value = aviso.titulo;
    form.elements.mensagem.value = aviso.mensagem;

    document.getElementById('tituloFormAviso').innerHTML = '<i class="bi bi-pencil-square me-2 text-danger"></i>Editar Aviso';
    document.getElementById('btnSalvarAviso').textContent = 'Salvar Aviso';
    document.getElementById('btnCancelarEdicaoAviso').classList.remove('d-none');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function excluirAviso(id) {
    if (!confirm('Deseja excluir este aviso?')) return;

    const formData = new FormData();
    formData.append('id', id);

    try {
        const response = await fetch('../../php/instrutor/aviso_excluir.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            resetarFormularioAviso();
            await carregarAvisos();
        } else {
            alert('Erro ao excluir: ' + resultado.mensagem);
        }
    } catch (erro) {
        alert('Erro de conexão ao excluir aviso.');
    }
}

function resetarFormularioAviso() {
    const form = document.getElementById('formNovoAviso');
    form.reset();
    document.getElementById('avisoId').value = '';
    document.getElementById('tituloFormAviso').innerHTML = '<i class="bi bi-pencil-square me-2 text-danger"></i>Novo Aviso';
    document.getElementById('btnSalvarAviso').textContent = 'Publicar Aviso';
    document.getElementById('btnCancelarEdicaoAviso').classList.add('d-none');
}

function escapeHtml(valor) {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
