document.addEventListener('DOMContentLoaded', () => {
    carregarInstrutores();
    carregarAcademias();

    document.getElementById('formEditarInstrutor').addEventListener('submit', salvarEdicao);
});

async function carregarInstrutores() {
    const tbody = document.getElementById('tabelaInstrutores');

    try {
        const response = await fetch('../../../php/admin/instrutor_get.php');
        const resultado = await response.json();

        tbody.innerHTML = '';

        if (resultado.status === 'ok' && resultado.data.length > 0) {
            resultado.data.forEach(inst => desenharInstrutorNaTabela(tbody, inst));
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Nenhum instrutor cadastrado.</td></tr>';
        }
    } catch (erro) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Falha ao comunicar com o servidor.</td></tr>';
    }
}

function desenharInstrutorNaTabela(tbody, inst) {
    const tr = document.createElement('tr');

    const horario = (inst.horario_abertura && inst.horario_fechamento)
        ? `${inst.horario_abertura} – ${inst.horario_fechamento}`
        : '—';

    tr.innerHTML = `
        <td>
            <div class="fw-bold text-white">${inst.nome}</div>
            <div class="text-muted small">${inst.email || ''}</div>
        </td>
        <td>
            <div class="fw-bold">${inst.academia_nome || '—'}</div>
        </td>
        <td class="text-muted">${inst.cnpj || '—'}</td>
        <td class="text-muted">${horario}</td>
        <td class="text-muted">${inst.telefone_responsavel || '—'}</td>
        <td class="text-center">
            <button class="btn btn-sm" style="background-color: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.35);" onclick='abrirModalEdicao(${JSON.stringify(inst)})'>
                <i class="bi bi-pencil-fill me-1"></i> Editar
            </button>
        </td>
    `;

    tbody.appendChild(tr);
}

async function carregarAcademias() {
    try {
        const response = await fetch('../../../php/admin/get_academias_ativas.php');
        const resultado = await response.json();

        const select = document.getElementById('editAcademiaId');
        select.innerHTML = '<option value="">Sem academia</option>';

        if (resultado.status === 'ok') {
            resultado.data.forEach(ac => {
                const opt = document.createElement('option');
                opt.value = ac.id;
                opt.textContent = ac.nome;
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error('Erro ao carregar academias:', e);
    }
}

function abrirModalEdicao(inst) {
    document.getElementById('editIdUsuario').value           = inst.id_usuario;
    document.getElementById('editNome').value                = inst.nome || '';
    document.getElementById('editEmail').value               = inst.email || '';
    document.getElementById('editTelefone').value            = inst.telefone_responsavel || '';
    document.getElementById('editCpf').value                 = inst.cpf || '';
    document.getElementById('editDataNascimento').value      = inst.dataNascimento ? inst.dataNascimento.substring(0, 10) : '';
    document.getElementById('editNomeFantasia').value        = inst.nome_fantasia || '';
    document.getElementById('editRazaoSocial').value         = inst.razao_social || '';
    document.getElementById('editCnpj').value                = inst.cnpj || '';
    document.getElementById('editHorarioAbertura').value     = inst.horario_abertura || '';
    document.getElementById('editHorarioFechamento').value   = inst.horario_fechamento || '';
    document.getElementById('editRenovacaoAutomatica').value = inst.renovacao_automatica ?? '1';

    const periodo = inst.periodo_contrato || 'semestral';
    const radioEl = document.querySelector(`input[name="periodo_contrato"][value="${periodo}"]`);
    if (radioEl) radioEl.checked = true;

    document.getElementById('editAcademiaId').value = inst.academia_id || '';

    const modal = new bootstrap.Modal(document.getElementById('modalEditarInstrutor'));
    modal.show();
}

async function salvarEdicao(e) {
    e.preventDefault();

    const form = e.target;
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Salvando...';

    const formData = new FormData(form);

    try {
        const response = await fetch('../../../php/admin/instrutor_update.php', {
            method: 'POST',
            body: formData
        });

        const resultado = await response.json();

        if (resultado.status === 'ok') {
            bootstrap.Modal.getInstance(document.getElementById('modalEditarInstrutor')).hide();
            await carregarInstrutores();
        } else {
            alert('Erro ao salvar: ' + resultado.mensagem);
        }
    } catch (erro) {
        alert('Falha ao comunicar com o servidor.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Salvar Alterações';
    }
}
