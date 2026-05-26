let instModalPerfil, instModalPresenca, instModalFaixa, instModalAtestado;

document.addEventListener('DOMContentLoaded', () => {
    instModalPerfil   = new bootstrap.Modal(document.getElementById('modalEditarPerfil'));
    instModalPresenca = new bootstrap.Modal(document.getElementById('modalHistoricoPresenca'));
    instModalFaixa    = new bootstrap.Modal(document.getElementById('modalEvolucaoFaixa'));
    instModalAtestado = new bootstrap.Modal(document.getElementById('modalAtestadoMedico'));

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
                <button class="btn btn-outline-secondary btn-atestado" title="Relatório Médico"><i class="bi bi-file-earmark-medical"></i></button>
                <button class="btn btn-outline-secondary btn-faixa" title="Desenvolvimento de Faixa"><i class="bi bi-trophy"></i></button>
                <button class="btn btn-danger btn-perfil" title="Gerenciar Perfil"><i class="bi bi-sliders"></i> Gerenciar</button>
                <button class="btn btn-outline-danger btn-deletar" title="Excluir Aluno"><i class="bi bi-trash3-fill"></i></button>
            </div>
        </td>
    `;

    tr.querySelector('.btn-presenca').addEventListener('click', () => abrirPresenca(aluno));
    tr.querySelector('.btn-atestado').addEventListener('click', () => abrirAtestado(aluno));
    tr.querySelector('.btn-faixa').addEventListener('click', () => abrirFaixa(aluno));
    tr.querySelector('.btn-perfil').addEventListener('click', () => abrirPerfil(aluno));
    tr.querySelector('.btn-deletar').addEventListener('click', () => deletarAluno(aluno));

    tbody.appendChild(tr);
}

function abrirPerfil(aluno) {
    document.getElementById('edit_id_usuario').value = aluno.id_usuario;
    document.getElementById('edit_nome').value = aluno.nome;
    document.getElementById('edit_telefone').value = aluno.telefone || '';
    document.getElementById('edit_plano').value = aluno.plano || 'mensal';
    document.getElementById('edit_status').value = aluno.status || 'Ativo';
    document.getElementById('edit_condicionamento').value = aluno.nivelCondicionamento || '5';
    document.getElementById('edit_atestado_arquivo').value = '';
    document.getElementById('edit_atestado_validade').value = '';

    const statusEl = document.getElementById('edit_atestado_status');
    if (aluno.atestadoMedico == 1) {
        statusEl.innerHTML = '<span style="color:#22c55e;"><i class="bi bi-check-circle-fill me-1"></i>Atestado regularizado — envie um novo arquivo para substituir.</span>';
    } else {
        statusEl.innerHTML = '<span style="color:#f59e0b;"><i class="bi bi-exclamation-triangle-fill me-1"></i>Nenhum atestado cadastrado. Envie um arquivo abaixo.</span>';
    }

    instModalPerfil.show();
}

async function salvarPerfilAluno() {
    const form     = document.getElementById('formEditarPerfil');
    const id       = document.getElementById('edit_id_usuario').value;
    const formData = new FormData(form);

    const arquivoEl  = document.getElementById('edit_atestado_arquivo');
    const validadeEl = document.getElementById('edit_atestado_validade');
    const statusEl   = document.getElementById('edit_atestado_status');
    const temArquivo = arquivoEl.files && arquivoEl.files.length > 0;

    if (temArquivo && !validadeEl.value) {
        statusEl.innerHTML = '<span style="color:#ef4444;"><i class="bi bi-x-circle-fill me-1"></i>Informe a data de validade do atestado antes de salvar.</span>';
        validadeEl.focus();
        return;
    }

    try {
        const response = await fetch(`/KOnect/php/instrutor/aluno_alterar.php?id=${id}`, {
            method: 'POST',
            body: formData
        });
        const json = await response.json();

        if (json.status !== 'ok') {
            alert("Erro do Sistema: " + json.mensagem);
            return;
        }

        if (temArquivo) {
            const file = arquivoEl.files[0];
            const extsPermitidas = ['pdf', 'jpg', 'jpeg', 'png'];
            const ext = file.name.split('.').pop().toLowerCase();

            if (!extsPermitidas.includes(ext)) {
                alert('Perfil salvo, mas o atestado não foi enviado: formato inválido (use PDF, JPG ou PNG).');
                instModalPerfil.hide();
                carregarAlunos();
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Perfil salvo, mas o atestado não foi enviado: arquivo maior que 5 MB.');
                instModalPerfil.hide();
                carregarAlunos();
                return;
            }

            const fdAtestado = new FormData();
            fdAtestado.append('id_aluno',      id);
            fdAtestado.append('data_validade', validadeEl.value);
            fdAtestado.append('arquivo',       file);

            const resAtestado = await fetch('/KOnect/php/instrutor/atestado_upload.php', {
                method: 'POST',
                body: fdAtestado
            });
            const jsonAtestado = await resAtestado.json();

            if (jsonAtestado.status !== 'ok') {
                alert('Perfil salvo, mas falha ao enviar atestado: ' + jsonAtestado.mensagem);
                instModalPerfil.hide();
                carregarAlunos();
                return;
            }
        }

        instModalPerfil.hide();
        carregarAlunos();
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

let _alunoAtestadoAtual = null;

function abrirAtestado(aluno) {
    _alunoAtestadoAtual = aluno;
    document.getElementById('nomeAtestadoAtleta').textContent = aluno.nome;
    document.getElementById('erroAtestado').style.display = 'none';
    document.getElementById('erroAtestado').textContent = '';
    document.getElementById('atestado_arquivo').value = '';
    document.getElementById('atestado_validade').value = '';
    document.getElementById('statusAtestadoAtual').innerHTML = `
        <div class="text-center py-2 text-muted">
            <div class="spinner-border spinner-border-sm text-danger me-2" role="status"></div>
            Carregando situação atual...
        </div>`;
    instModalAtestado.show();
    _buscarAtestadoAtual(aluno.id_usuario);
}

async function _buscarAtestadoAtual(idAluno) {
    const container = document.getElementById('statusAtestadoAtual');
    try {
        const response = await fetch(`/KOnect/php/instrutor/atestado_get.php?id=${idAluno}`);
        const json = await response.json();

        if (json.status !== 'ok') {
            container.innerHTML = `<p class="text-danger small">${json.mensagem}</p>`;
            return;
        }

        container.innerHTML = json.data
            ? _renderizarAtestadoAtual(json.data)
            : _renderizarSemAtestado();

    } catch (e) {
        container.innerHTML = `<p class="text-danger small">Falha ao consultar o servidor.</p>`;
    }
}

function _renderizarAtestadoAtual(d) {
    const dataValidade = new Date(d.data_validade + 'T00:00:00').toLocaleDateString('pt-BR');
    const dataUpload   = new Date(d.data_upload).toLocaleDateString('pt-BR');

    const statusCores = {
        'Ativo':      { bg: 'rgba(34,197,94,.15)',    color: '#22c55e',       icon: 'bi-check-circle-fill' },
        'Expirado':   { bg: 'rgba(245,158,11,.15)',   color: '#f59e0b',       icon: 'bi-exclamation-triangle-fill' },
        'Substituído':{ bg: 'rgba(100,116,139,.15)',  color: '#94a3b8',       icon: 'bi-arrow-repeat' },
    };
    const cor = statusCores[d.status] || statusCores['Ativo'];

    return `
        <div class="p-3 rounded mb-2 d-flex align-items-start gap-3"
             style="background:${cor.bg};border:1px solid ${cor.color}40;">
            <i class="bi ${cor.icon} fs-4 mt-1" style="color:${cor.color};"></i>
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start">
                    <span class="fw-bold text-white">${d.nome_arquivo}</span>
                    <span class="badge rounded-pill px-2" style="background:${cor.bg};color:${cor.color};border:1px solid ${cor.color}60;font-size:.75rem;">
                        ${d.status}
                    </span>
                </div>
                <div class="text-muted small mt-1">
                    <i class="bi bi-upload me-1"></i>Enviado em ${dataUpload}
                    &nbsp;·&nbsp;
                    <i class="bi bi-calendar-event me-1"></i>Válido até <strong style="color:${cor.color};">${dataValidade}</strong>
                </div>
            </div>
        </div>`;
}

function _renderizarSemAtestado() {
    return `
        <div class="p-3 rounded mb-2 d-flex align-items-center gap-3"
             style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);">
            <i class="bi bi-exclamation-triangle-fill text-warning fs-4"></i>
            <span class="text-warning fw-bold">Nenhum atestado médico cadastrado para este aluno.</span>
        </div>`;
}

async function deletarAluno(aluno) {
    const confirmado = confirm(`Tem certeza que deseja excluir o aluno "${aluno.nome}"?\n\nEsta ação é permanente e não pode ser desfeita.`);
    if (!confirmado) return;

    try {
        const response = await fetch(`/KOnect/php/instrutor/aluno_excluir.php?id=${aluno.id_usuario}`);
        const json = await response.json();

        if (json.status === 'ok') {
            carregarAlunos();
        } else {
            alert('Erro ao excluir aluno: ' + json.mensagem);
        }
    } catch (e) {
        console.error('Erro ao excluir aluno:', e);
        alert('Falha ao se comunicar com o servidor.');
    }
}

async function salvarAtestado() {
    const erroEl   = document.getElementById('erroAtestado');
    const arquivo  = document.getElementById('atestado_arquivo');
    const validade = document.getElementById('atestado_validade');

    erroEl.style.display = 'none';
    erroEl.textContent   = '';

    if (!validade.value) {
        erroEl.textContent   = 'Campo obrigatório não preenchido: data de validade.';
        erroEl.style.display = 'block';
        validade.focus();
        return;
    }

    if (!arquivo.files || arquivo.files.length === 0) {
        erroEl.textContent   = 'Selecione um arquivo para enviar.';
        erroEl.style.display = 'block';
        arquivo.focus();
        return;
    }

    const file = arquivo.files[0];
    const extsPermitidas = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!extsPermitidas.includes(ext)) {
        erroEl.textContent   = 'Formato de arquivo inválido. Use PDF, JPG ou PNG.';
        erroEl.style.display = 'block';
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        erroEl.textContent   = 'Arquivo muito grande. Tamanho máximo permitido: 5 MB.';
        erroEl.style.display = 'block';
        return;
    }

    const formData = new FormData();
    formData.append('id_aluno',      _alunoAtestadoAtual.id_usuario);
    formData.append('data_validade', validade.value);
    formData.append('arquivo',       file);

    const btnSalvar = document.querySelector('#modalAtestadoMedico .btn-konect');
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

    try {
        const response = await fetch('/KOnect/php/instrutor/atestado_upload.php', {
            method: 'POST',
            body: formData
        });
        const json = await response.json();

        if (json.status === 'ok') {
            arquivo.value  = '';
            validade.value = '';
            _buscarAtestadoAtual(_alunoAtestadoAtual.id_usuario);
            carregarAlunos();
        } else {
            erroEl.textContent   = json.mensagem;
            erroEl.style.display = 'block';
        }
    } catch (e) {
        erroEl.textContent   = 'Falha ao se comunicar com o servidor.';
        erroEl.style.display = 'block';
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = '<i class="bi bi-floppy-fill me-2"></i>Salvar Atestado';
    }
}
