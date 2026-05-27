let academias = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarAcademias();
    document.getElementById('formNovaAcademia').addEventListener('submit', criarAcademia);
});

async function carregarAcademias() {
    try {
        const response = await fetch(`../../../php/academia/academia_get.php?_=${Date.now()}`);
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            academias = resultado.data;
            renderizarAcademias();
        } else {
            document.getElementById('corpoAcademias').innerHTML =
                '<tr><td colspan="5" class="text-center text-muted py-4">Nenhuma academia cadastrada.</td></tr>';
        }
    } catch (erro) {
        document.getElementById('corpoAcademias').innerHTML =
            '<tr><td colspan="5" class="text-center text-danger py-4">Falha ao comunicar com o servidor.</td></tr>';
    }
}

function renderizarAcademias() {
    const tbody = document.getElementById('corpoAcademias');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (academias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Nenhuma academia cadastrada.</td></tr>';
        return;
    }

    academias.forEach(academia => {
        const ativa = academia.status_ativo == 1;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold">${academia.nome}</td>
            <td class="text-muted">${academia.cnpj || '—'}</td>
            <td class="text-muted">${academia.endereco || '—'}</td>
            <td>
                <span class="badge ${ativa ? 'bg-success' : 'bg-secondary'}">
                    ${ativa ? 'Ativa' : 'Inativa'}
                </span>
            </td>
            <td class="text-center d-flex gap-2 justify-content-center">
                <button class="btn btn-sm" style="background-color:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.35);"
                    onclick="abrirModalEditarAcademia(${academia.id})">
                    <i class="bi bi-pencil-fill me-1"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-secondary"
                    onclick="confirmarExcluirAcademia(${academia.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function abrirModalEditarAcademia(academiaId) {
    const academia = academias.find(a => a.id === academiaId);
    if (!academia) return;

    document.getElementById('editAcademiaId').value       = academia.id;
    document.getElementById('editAcademiaNome').value     = academia.nome;
    document.getElementById('editAcademiaEndereco').value = academia.endereco || '';
    document.getElementById('editAcademiaCNPJ').value     = academia.cnpj || '';
    document.getElementById('editAcademiaStatus').checked = academia.status_ativo == 1;

    new bootstrap.Modal(document.getElementById('modalEditarAcademia')).show();
}

async function salvarAlteracoesAcademia() {
    const id  = document.getElementById('editAcademiaId').value;
    const btn = document.getElementById('btnSalvarEdicaoAcademia');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Salvando...';

    const formData = new FormData();
    formData.append('nome',        document.getElementById('editAcademiaNome').value);
    formData.append('endereco',    document.getElementById('editAcademiaEndereco').value);
    formData.append('status_ativo', document.getElementById('editAcademiaStatus').checked ? 1 : 0);

    try {
        const response = await fetch(`../../../php/academia/academia_alterar.php?id=${id}`, {
            method: 'POST',
            body: formData
        });
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarAcademia')).hide();
            mostrarFeedback('sucessoAcademias', 'Academia atualizada com sucesso!');
            await carregarAcademias();
        } else {
            mostrarFeedback('erroAcademias', 'Erro ao atualizar: ' + resultado.mensagem);
        }
    } catch (erro) {
        mostrarFeedback('erroAcademias', 'Erro ao conectar com o servidor.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Salvar';
    }
}

async function criarAcademia(e) {
    e.preventDefault();

    const btn     = document.getElementById('btnSalvarNovaAcademia');
    const erroBox = document.getElementById('erroNovaAcademia');
    erroBox.classList.add('d-none');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Criando...';

    const formData = new FormData();
    formData.append('nome',     document.getElementById('novaAcademiaNome').value);
    formData.append('cnpj',     document.getElementById('novaAcademiaCnpj').value);
    formData.append('endereco', document.getElementById('novaAcademiaEndereco').value);

    try {
        const response = await fetch('../../../php/academia/academia_novo.php', {
            method: 'POST',
            body: formData
        });
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaAcademia')).hide();
            document.getElementById('formNovaAcademia').reset();
            mostrarFeedback('sucessoAcademias', 'Academia criada com sucesso!');
            await carregarAcademias();
        } else {
            erroBox.textContent = resultado.mensagem;
            erroBox.classList.remove('d-none');
        }
    } catch (erro) {
        erroBox.textContent = 'Erro ao conectar com o servidor.';
        erroBox.classList.remove('d-none');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Criar Academia';
    }
}

async function confirmarExcluirAcademia(academiaId) {
    const academia = academias.find(a => a.id === academiaId);
    if (!confirm(`Excluir a academia "${academia?.nome}"? Esta ação não pode ser desfeita.`)) return;

    try {
        const response = await fetch(`../../../php/academia/academia_excluir.php?id=${academiaId}`);
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            mostrarFeedback('sucessoAcademias', 'Academia excluída com sucesso!');
            await carregarAcademias();
        } else {
            mostrarFeedback('erroAcademias', 'Erro ao excluir: ' + resultado.mensagem);
        }
    } catch (erro) {
        mostrarFeedback('erroAcademias', 'Erro ao conectar com o servidor.');
    }
}

function mostrarFeedback(elementId, mensagem) {
    const el = document.getElementById(elementId);
    el.textContent = mensagem;
    el.classList.remove('d-none');
    setTimeout(() => el.classList.add('d-none'), 4000);
}
