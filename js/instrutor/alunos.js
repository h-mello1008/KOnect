let instModalPerfil, instModalPresenca, instModalFaixa;

document.addEventListener('DOMContentLoaded', () => {
    instModalPerfil   = new bootstrap.Modal(document.getElementById('modalEditarPerfil'));
    instModalPresenca = new bootstrap.Modal(document.getElementById('modalHistoricoPresenca'));
    instModalFaixa    = new bootstrap.Modal(document.getElementById('modalEvolucaoFaixa'));

    carregarAlunos();
});

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

let _alunoPresencaAtual = null;

function abrirPresenca(aluno) {
    _alunoPresencaAtual = aluno;
    document.getElementById('nomePresencaAtleta').textContent = aluno.nome;
    document.getElementById('filtroDataInicio').value = '';
    document.getElementById('filtroDataFim').value = '';
    instModalPresenca.show();
    _buscarPresenca(aluno.id_usuario, null, null);
}

function filtrarPresenca() {
    if (!_alunoPresencaAtual) return;
    const inicio = document.getElementById('filtroDataInicio').value;
    const fim    = document.getElementById('filtroDataFim').value;
    _buscarPresenca(_alunoPresencaAtual.id_usuario, inicio || null, fim || null);
}

function limparFiltroPresenca() {
    document.getElementById('filtroDataInicio').value = '';
    document.getElementById('filtroDataFim').value = '';
    if (_alunoPresencaAtual) _buscarPresenca(_alunoPresencaAtual.id_usuario, null, null);
}

async function _buscarPresenca(idAluno, dataInicio, dataFim) {
    const corpo     = document.getElementById('corpoHistoricoPresenca');
    const contador  = document.getElementById('contadorPresencas');
    const totalSpan = document.getElementById('totalPresencas');

    contador.style.display = 'none';
    corpo.innerHTML = `
        <div class="text-center py-5 text-muted">
            <div class="spinner-border text-danger mb-3" role="status"></div>
            <p class="mb-0">Buscando registros de treino...</p>
        </div>`;

    try {
        let url = `/KOnect/php/instrutor/presenca_historico.php?id=${idAluno}`;
        if (dataInicio) url += `&data_inicio=${dataInicio}`;
        if (dataFim)    url += `&data_fim=${dataFim}`;

        const response = await fetch(url);
        const json = await response.json();

        if (json.status !== 'ok') {
            corpo.innerHTML = `<p class="text-center text-danger py-4">Erro: ${json.mensagem}</p>`;
            return;
        }

        if (json.total === 0) {
            corpo.innerHTML = _renderizarEstadoVazio(dataInicio, dataFim);
            return;
        }

        totalSpan.textContent = json.total;
        contador.style.display = 'block';
        corpo.innerHTML = _renderizarTabelaPresenca(json.data);

    } catch (e) {
        console.error('Erro no histórico de presença:', e);
        corpo.innerHTML = `<p class="text-center text-danger py-4">Falha ao se comunicar com o servidor.</p>`;
    }
}

function _renderizarTabelaPresenca(registros) {
    const linhas = registros.map(r => {
        const data = r.data
            ? new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR')
            : '—';
        const conteudo = r.conteudo
            ? `<div class="text-muted small mt-1">${r.conteudo}</div>`
            : '';
        return `
            <tr>
                <td class="text-white fw-bold">${data}</td>
                <td>${r.horario || '—'}</td>
                <td>
                    <span class="badge rounded-pill px-3" style="background:rgba(225,29,72,.15);color:var(--accent);border:1px solid rgba(225,29,72,.25);">
                        ${r.modalidade || '—'}
                    </span>
                </td>
                <td>
                    <div class="fw-bold text-white"><i class="bi bi-person-fill me-1 text-danger"></i>${r.instrutor || '—'}</div>
                    ${conteudo}
                </td>
            </tr>`;
    }).join('');

    return `
        <div class="table-responsive">
            <table class="table table-dark-konect table-hover align-middle mb-0" style="font-size:.9rem;">
                <thead>
                    <tr>
                        <th><i class="bi bi-calendar3 me-1"></i>Data</th>
                        <th><i class="bi bi-clock me-1"></i>Horário</th>
                        <th><i class="bi bi-shield-fill me-1"></i>Modalidade</th>
                        <th><i class="bi bi-person-badge me-1"></i>Instrutor / Mestre</th>
                    </tr>
                </thead>
                <tbody>${linhas}</tbody>
            </table>
        </div>`;
}

function _renderizarEstadoVazio(dataInicio, dataFim) {
    const temFiltro = dataInicio || dataFim;
    const mensagem  = temFiltro
        ? 'Nenhum registro de treino encontrado para os critérios selecionados.'
        : 'Este aluno ainda não possui registros de treino.';
    return `
        <div class="text-center py-5">
            <div class="mb-3" style="font-size:2.5rem;">🥋</div>
            <p class="text-muted mb-3">${mensagem}</p>
            ${temFiltro ? `<button class="btn btn-outline-secondary btn-sm" onclick="limparFiltroPresenca()"><i class="bi bi-arrow-left me-1"></i>Ver todos os registros</button>` : ''}
        </div>`;
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
