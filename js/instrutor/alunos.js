let instModalPerfil, instModalPresenca, instModalFaixa;

document.addEventListener('DOMContentLoaded', () => {
    instModalPerfil   = new bootstrap.Modal(document.getElementById('modalEditarPerfil'));
    instModalPresenca = new bootstrap.Modal(document.getElementById('modalHistoricoPresenca'));
    instModalFaixa    = new bootstrap.Modal(document.getElementById('modalEvolucaoFaixa'));

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('hidden.bs.modal', limparBackdropsTravados);
    });

    carregarAlunos();
});

function limparBackdropsTravados() {
    if (document.querySelector('.modal.show')) return;

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
}

async function carregarAlunos() {
    const tbody = document.getElementById('tabelaAlunos');

    const instrutorLogado = JSON.parse(localStorage.getItem('instrutor_logado') || '{}');
    if (!instrutorLogado.id) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Sessão expirada. Faça login novamente.</td></tr>';
        return;
    }

    try {
        const response = await fetch(`/KOnect/php/instrutor/aluno_get.php?instrutor_id=${instrutorLogado.id}`);
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status} ao buscar alunos`);
        }
        const resultado = await response.json();

        tbody.innerHTML = '';

        if (resultado.status === 'ok' && resultado.data.length > 0) {
            resultado.data.forEach(aluno => {
                desenharAlunoNaTabela(tbody, aluno);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Nenhum aluno cadastrado.</td></tr>';
        }
    } catch (erro) {
        console.error("Erro no fetch de alunos:", erro);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Falha ao comunicar com o servidor.</td></tr>';
    }
}

function desenharAlunoNaTabela(tbody, aluno) {
    const tr = document.createElement('tr');

    let badgeClass = 'badge-sucesso';
    if(aluno.status === 'Inativo') badgeClass = 'badge-alerta';
    if(aluno.status === 'Bloqueado') badgeClass = 'badge-perigo';

    tr.innerHTML = `
        <td>
            <div class="fw-bold text-white">${aluno.nome}</div>
            <div class="text-muted small">${aluno.email || ''}</div>
        </td>
        <td>
            <i class="bi bi-bookmark-fill me-1" style="color: ${aluno.tagCor || '#fff'}"></i>
            Grau ${aluno.graduacao_id || '1'}
        </td>
        <td class="text-center fw-bold text-info">
            <i class="bi bi-clock-history me-1"></i> 85%
        </td>
        <td class="text-center">
            <span class="badge ${badgeClass} px-2 py-1 rounded-pill small">${aluno.status || 'Ativo'}</span>
        </td>
        <td class="text-end">
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary btn-presenca" title="Histórico de Presença"><i class="bi bi-calendar-check"></i></button>
                <button class="btn btn-outline-secondary btn-faixa" title="Desenvolvimento de Faixa"><i class="bi bi-trophy"></i></button>
                <button class="btn btn-danger btn-perfil" title="Gerenciar Perfil"><i class="bi bi-sliders"></i> Gerenciar</button>
                <button class="btn btn-outline-danger btn-deletar" title="Deletar Aluno"><i class="bi bi-trash"></i></button>
            </div>
        </td>
    `;

    tr.querySelector('.btn-presenca').addEventListener('click', () => abrirPresenca(aluno));
    tr.querySelector('.btn-faixa').addEventListener('click', () => abrirFaixa(aluno));
    tr.querySelector('.btn-perfil').addEventListener('click', () => abrirPerfil(aluno));
    tr.querySelector('.btn-deletar').addEventListener('click', () => deletarAluno(aluno, tr));

    tbody.appendChild(tr);
}

function abrirPerfil(aluno) {
    document.getElementById('edit_id_usuario').value = aluno.id_usuario;
    document.getElementById('edit_nome').value = aluno.nome;
    document.getElementById('edit_telefone').value = aluno.telefone || '';
    document.getElementById('edit_plano').value = aluno.plano || 'mensal';
    document.getElementById('edit_status').value = aluno.status || 'Ativo';
    document.getElementById('edit_atestado').value = aluno.atestadoMedico || '0';
    document.getElementById('edit_condicionamento').value = aluno.nivelCondicionamento || '5';

    instModalPerfil.show();
}

async function salvarPerfilAluno() {
    const form = document.getElementById('formEditarPerfil');
    const id = document.getElementById('edit_id_usuario').value;
    const formData = new FormData(form);

    try {
        const response = await fetch(`/KOnect/php/instrutor/aluno_alterar.php?id=${id}`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status} ao salvar aluno`);
        }
        const json = await response.json();

        if (json.status === 'ok') {
            alert(json.mensagem);
            instModalPerfil.hide();
            carregarAlunos();
        } else {
            alert("Erro do Sistema: " + json.mensagem);
        }
    } catch (e) {
        console.error("Erro na alteração:", e);
        alert("Erro ao enviar dados de atualização.");
    }
}

async function abrirPresenca(aluno) {
    // Seleciona o corpo do modal de presença
    const modalBody = document.querySelector('#modalHistoricoPresenca .modal-body');
    
    // Mostra o nome do aluno e um ícone de carregamento enquanto busca
    modalBody.innerHTML = `
        <p class="fw-bold text-white mb-3 fs-5">${aluno.nome}</p>
        <div class="text-center text-muted py-3">
            <div class="spinner-border text-danger mb-2" role="status"></div>
            <p>Calculando total de presenças...</p>
        </div>
    `;
    
    instModalPresenca.show();

    try {
        const response = await fetch(`/KOnect/php/instrutor/aluno_progresso_faixa.php?id=${aluno.id_usuario}`);
        const json = await response.json();

        if (json.status === 'ok') {
            const totalPresencas = json.data.presencas;
            
            modalBody.innerHTML = `
                <p class="fw-bold text-white mb-3 fs-5">${aluno.nome}</p>
                <div class="p-4 rounded text-center" style="background-color: rgba(225, 29, 72, 0.1); border: 1px solid var(--accent);">
                    <i class="bi bi-calendar-check-fill fs-1 d-block mb-2" style="color: var(--accent);"></i>
                    <h1 class="fw-bold text-white mb-0" style="font-size: 3rem;">${totalPresencas}</h1>
                    <span class="text-muted small text-uppercase fw-bold mt-2 d-block">Presenças Registradas</span>
                </div>
            `;
        } else {
            modalBody.innerHTML = `
                <p class="fw-bold text-white mb-3 fs-5">${aluno.nome}</p>
                <p class="text-danger">Erro: ${json.mensagem}</p>
            `;
        }
    } catch (erro) {
        console.error("Erro ao buscar presenças:", erro);
        modalBody.innerHTML = `
            <p class="fw-bold text-white mb-3 fs-5">${aluno.nome}</p>
            <p class="text-danger">Erro ao comunicar com o servidor.</p>
        `;
    }
}

async function abrirFaixa(aluno) {
    const modalBody = document.getElementById('bodyModalFaixa');

    modalBody.innerHTML = `
        <div class="text-center text-muted">
            <div class="spinner-border text-danger mb-3" role="status"></div>
            <p>Calculando requisitos de exame...</p>
        </div>
    `;
    instModalFaixa.show();

    try {
        const response = await fetch(`/KOnect/php/instrutor/aluno_progresso_faixa.php?id=${aluno.id_usuario}`);
        const json = await response.json();

        if (json.status === 'ok') {
            desenharProgressoFaixaNaTela(modalBody, json.data);
        } else {
            modalBody.innerHTML = `<p class="text-center text-danger py-4">Erro: ${json.mensagem}</p>`;
        }
    } catch (e) {
        console.error("Erro na evolução de faixa:", e);
        modalBody.innerHTML = `<p class="text-center text-danger py-4">Erro ao se conectar com o servidor.</p>`;
    }
}

async function deletarAluno(aluno, tr) {
    if (!confirm(`Tem certeza que deseja deletar o aluno "${aluno.nome}"? Esta ação não pode ser desfeita.`)) return;

    try {
        const response = await fetch(`/KOnect/php/instrutor/aluno_deletar.php?id=${aluno.id_usuario}`, {
            method: 'DELETE'
        });
        const json = await response.json();

        if (json.status === 'ok') {
            tr.remove();
        } else {
            alert('Erro ao deletar: ' + json.mensagem);
        }
    } catch (e) {
        console.error("Erro ao deletar aluno:", e);
        alert('Erro ao comunicar com o servidor.');
    }
}

function desenharProgressoFaixaNaTela(container, data) {
    let porcentagem = 0;
    let textoRodape = "";
    let htmlProximaFaixa = "";

    if (data.proxima_faixa) {
        porcentagem = data.meta_aulas > 0 ? Math.floor((data.presencas / data.meta_aulas) * 100) : 0;
        if (porcentagem > 100) porcentagem = 100;

        let aulasFaltantes = data.meta_aulas - data.presencas;
        if (aulasFaltantes <= 0) {
            textoRodape = `<span class="text-success fw-bold"><i class="bi bi-check-circle-fill"></i> Aluno apto para o próximo exame!</span>`;
            porcentagem = 100;
        } else {
            textoRodape = `Faltam <strong class="text-white">${aulasFaltantes} aulas</strong> para se tornar elegível ao exame.`;
        }

        htmlProximaFaixa = `<div class="text-muted small mt-2">Próxima meta: <span class="text-white fw-bold">${data.proxima_faixa}</span></div>`;
    } else {
        porcentagem = 100;
        textoRodape = `<span class="text-warning fw-bold"><i class="bi bi-star-fill"></i> Graduação máxima alcançada no sistema.</span>`;
    }

    container.innerHTML = `
        <div class="text-center">
            <div class="fs-1 mb-2">🥋</div>
            <h5 class="fw-bold text-white mb-3">${data.nome}</h5>

            <div class="p-3 bg-black bg-opacity-40 rounded border border-secondary mb-4 text-center">
                <span class="text-muted small d-block mb-1">Faixa Atual</span>
                <span class="fw-bold text-danger fs-4 text-uppercase">${data.faixa_atual}</span>
                ${htmlProximaFaixa}
            </div>
        </div>

        <div class="mb-2 d-flex justify-content-between small">
            <span class="text-muted">Aulas Assistidas: <strong class="text-white">${data.presencas}/${data.meta_aulas}</strong></span>
            <span class="text-white fw-bold">${porcentagem}%</span>
        </div>

        <div class="progress mb-3" style="height: 12px; background-color: rgba(255,255,255,0.05); border: 1px solid var(--border);">
            <div class="progress-bar bg-danger progress-bar-striped ${porcentagem < 100 ? 'progress-bar-animated' : ''}"
                 role="progressbar"
                 style="width: ${porcentagem}%"></div>
        </div>

        <p class="text-center small mb-0" style="color: var(--muted);">${textoRodape}</p>
    `;
}
