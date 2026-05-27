let alunos = [];
let alunoEmEdicao = null;

document.addEventListener('DOMContentLoaded', () => {
    validarSessao();
    carregarAlunos();
    carregarAcademias();
    document.getElementById('formNovoAluno').addEventListener('submit', criarNovoAluno);
});

async function validarSessao() {
    try {
        const response = await fetch('../../../php/valida_sessao.php');
        const resultado = await response.json();
        if (resultado.status === 'ok') {
            document.getElementById('adminNome').textContent = resultado.data.email || 'Administrador';
        } else {
            window.location.href = '../login_admin/login_admin.html';
        }
    } catch (e) {
        window.location.href = '../login_admin/login_admin.html';
    }
}

function logout() {
    localStorage.removeItem('admin_logado');
    window.location.href = '../login_admin/login_admin.html';
}

async function carregarAlunos() {
    const tbody = document.getElementById('corpoAlunos');
    try {
        const response = await fetch(`../../../php/aluno/aluno_get.php?_=${Date.now()}`);
        const resultado = await response.json();

        tbody.innerHTML = '';

        if (resultado.status === 'ok' && resultado.data.length > 0) {
            alunos = resultado.data;
            renderizarAlunos(alunos);
        } else if (resultado.status === 'ok') {
            alunos = [];
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Nenhum aluno cadastrado.</td></tr>';
        } else {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Erro ao carregar: ${resultado.mensagem}</td></tr>`;
        }
    } catch (erro) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Falha ao comunicar com o servidor.</td></tr>';
    }
}

async function carregarAcademias() {
    try {
        const response = await fetch(`../../../php/academia/academia_get.php?_=${Date.now()}`);
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            const filtro = document.getElementById('filtroAcademia');
            const selectNovo = document.getElementById('novoAlunoAcademia');

            resultado.data.filter(a => a.status_ativo == 1).forEach(ac => {
                const opt = `<option value="${ac.id}">${ac.nome}</option>`;
                filtro.innerHTML += opt;
                selectNovo.innerHTML += opt;
            });
        }
    } catch (e) {
        console.error('Erro ao carregar academias:', e);
    }
}

function renderizarAlunos(lista) {
    const tbody = document.getElementById('corpoAlunos');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Nenhum aluno encontrado.</td></tr>';
        return;
    }

    lista.forEach(aluno => {
        const ativo = aluno.status_ativo == 1;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${aluno.nome}</strong></td>
            <td>${aluno.email || '—'}</td>
            <td>${aluno.telefone || '—'}</td>
            <td>${aluno.academia_nome || '—'}</td>
            <td><span class="badge ${ativo ? 'bg-success' : 'bg-secondary'}">${ativo ? 'Ativo' : 'Inativo'}</span></td>
            <td>
                <button class="btn btn-sm me-1" style="background-color:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.35);"
                    onclick="abrirModalEditarAluno(${aluno.id})">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="confirmarExcluirAluno(${aluno.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function aplicarFiltros() {
    const nome     = document.getElementById('filtroNome').value.toLowerCase();
    const academia = document.getElementById('filtroAcademia').value;
    const status   = document.getElementById('filtroStatus').value;

    const filtrados = alunos.filter(a => {
        const nomeOk     = a.nome.toLowerCase().includes(nome);
        const academiaOk = !academia || a.academia_id == academia;
        const statusOk   = !status
            || (status === 'Ativo'   && a.status_ativo == 1)
            || (status === 'Inativo' && a.status_ativo != 1);
        return nomeOk && academiaOk && statusOk;
    });

    renderizarAlunos(filtrados);
}

async function criarNovoAluno(e) {
    e.preventDefault();

    const btn     = document.getElementById('btnSalvarNovoAluno');
    const erroBox = document.getElementById('erroNovoAluno');
    erroBox.classList.add('d-none');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Criando...';

    const formData = new FormData();
    formData.append('nome',           document.getElementById('novoAlunoNome').value);
    formData.append('email',          document.getElementById('novoAlunoEmail').value);
    formData.append('senha',          document.getElementById('novoAlunoSenha').value);
    formData.append('telefone',       document.getElementById('novoAlunoTelefone').value);
    formData.append('dataNascimento', document.getElementById('novoAlunoDataNascimento').value);
    formData.append('academia_id',    document.getElementById('novoAlunoAcademia').value);

    try {
        const response = await fetch('../../../php/admin/aluno_novo_admin.php', {
            method: 'POST',
            body: formData
        });
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovoAluno')).hide();
            document.getElementById('formNovoAluno').reset();
            mostrarFeedback('sucessoAlunos', 'Aluno criado com sucesso!');
            await carregarAlunos();
        } else {
            erroBox.textContent = resultado.mensagem;
            erroBox.classList.remove('d-none');
        }
    } catch (erro) {
        erroBox.textContent = 'Erro ao comunicar com o servidor.';
        erroBox.classList.remove('d-none');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Criar Aluno';
    }
}

function abrirModalEditarAluno(alunoId) {
    const aluno = alunos.find(a => a.id === alunoId);
    if (!aluno) return;

    alunoEmEdicao = aluno;
    document.getElementById('editAlunoNome').value     = aluno.nome;
    document.getElementById('editAlunoEmail').value    = aluno.email || '';
    document.getElementById('editAlunoTelefone').value = aluno.telefone || '';
    document.getElementById('editAlunoStatus').value   = aluno.status_ativo == 1 ? 'Ativo' : 'Inativo';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarAluno')).show();
}

async function salvarAlteracoesAluno() {
    if (!alunoEmEdicao) return;

    const btn = document.getElementById('btnSalvarEdicaoAluno');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Salvando...';

    const formData = new FormData();
    formData.append('id',           alunoEmEdicao.id);
    formData.append('nome',         document.getElementById('editAlunoNome').value);
    formData.append('email',        document.getElementById('editAlunoEmail').value);
    formData.append('telefone',     document.getElementById('editAlunoTelefone').value);
    formData.append('status_ativo', document.getElementById('editAlunoStatus').value === 'Ativo' ? 1 : 0);

    try {
        const response = await fetch('../../../php/aluno/aluno_alterar.php', {
            method: 'POST',
            body: formData
        });
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditarAluno')).hide();
            mostrarFeedback('sucessoAlunos', 'Aluno atualizado com sucesso!');
            await carregarAlunos();
        } else {
            mostrarFeedback('erroAlunos', 'Erro: ' + resultado.mensagem);
        }
    } catch (erro) {
        mostrarFeedback('erroAlunos', 'Erro ao comunicar com o servidor.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Salvar';
        alunoEmEdicao = null;
    }
}

async function confirmarExcluirAluno(alunoId) {
    const aluno = alunos.find(a => a.id === alunoId);
    if (!confirm(`Excluir o aluno "${aluno?.nome}"? Esta ação não pode ser desfeita.`)) return;

    const formData = new FormData();
    formData.append('id', alunoId);

    try {
        const response = await fetch('../../../php/aluno/aluno_excluir.php', {
            method: 'POST',
            body: formData
        });
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            mostrarFeedback('sucessoAlunos', 'Aluno excluído com sucesso!');
            await carregarAlunos();
        } else {
            mostrarFeedback('erroAlunos', 'Erro: ' + resultado.mensagem);
        }
    } catch (erro) {
        mostrarFeedback('erroAlunos', 'Erro ao comunicar com o servidor.');
    }
}

function mostrarFeedback(elementId, mensagem) {
    const el = document.getElementById(elementId);
    el.textContent = mensagem;
    el.classList.remove('d-none');
    setTimeout(() => el.classList.add('d-none'), 4000);
}
