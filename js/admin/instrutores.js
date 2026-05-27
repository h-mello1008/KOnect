document.addEventListener('DOMContentLoaded', () => {
    carregarInstrutores();
});

async function carregarInstrutores() {
    const tbody = document.getElementById('tabelaInstrutores');

    try {
        const response = await fetch('../../../php/admin/instrutor_get.php');
        const resultado = await response.json();

        tbody.innerHTML = '';

        if (resultado.status === 'ok' && resultado.data.length > 0) {
            resultado.data.forEach(inst => {
                desenharInstrutorNaTabela(tbody, inst);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Nenhum instrutor cadastrado.</td></tr>';
        }
    } catch (erro) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Falha ao comunicar com o servidor.</td></tr>';
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
            <div class="fw-bold">${inst.nome_fantasia || '—'}</div>
            <div class="text-muted small">${inst.razao_social || ''}</div>
        </td>
        <td class="text-muted">${inst.cnpj || '—'}</td>
        <td class="text-muted">${horario}</td>
        <td class="text-muted">${inst.telefone_responsavel || '—'}</td>
    `;

    tbody.appendChild(tr);
}
