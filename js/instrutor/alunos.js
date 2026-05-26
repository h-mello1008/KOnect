// Arquivo: js/instrutor/alunos.js

let instModalPerfil, instModalPresenca, instModalFaixa;

document.addEventListener('DOMContentLoaded', () => {
    instModalPerfil   = new bootstrap.Modal(document.getElementById('modalEditarPerfil'));
    instModalPresenca = new bootstrap.Modal(document.getElementById('modalHistoricoPresenca'));
    instModalFaixa    = new bootstrap.Modal(document.getElementById('modalEvolucaoFaixa'));

    carregarAlunos();
});

// =========================================================================
// MÓDULO 1: LISTAGEM DE ALUNOS (Lógica de Dados)
// =========================================================================
async function carregarAlunos() {
    const tbody = document.getElementById('tabelaAlunos');
    
    try {
        const response = await fetch('/KOnect/php/instrutor/aluno_get.php');
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

// =========================================================================
// MÓDULO 1.1: LISTAGEM DE ALUNOS (Lógica Visual / DOM)
// =========================================================================
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
            </div>
        </td>
    `;

    tr.querySelector('.btn-presenca').addEventListener('click', () => abrirPresenca(aluno));
    tr.querySelector('.btn-faixa').addEventListener('click', () => abrirFaixa(aluno));
    tr.querySelector('.btn-perfil').addEventListener('click', () => abrirPerfil(aluno));

    tbody.appendChild(tr);
}

// =========================================================================
// MÓDULO 2: GESTÃO DE PERFIL
// =========================================================================
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

// =========================================================================
// MÓDULO 3: PRESENÇA E PROGRESSO DE FAIXA
// =========================================================================
function abrirPresenca(aluno) {
    document.getElementById('nomePresencaAtleta').textContent = aluno.nome;
    instModalPresenca.show();
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

// Lógica Visual para a Faixa
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