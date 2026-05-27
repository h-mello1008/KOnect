document.addEventListener('DOMContentLoaded', () => {
    prepararFormularioAula();
    carregarGradeHoraria();
});

async function carregarGradeHoraria() {
    const diasDaSemana = ['seg', 'ter', 'qua', 'qui', 'sex'];
    diasDaSemana.forEach(dia => {
        const coluna = document.getElementById(`classes-${dia}`);
        if (coluna) coluna.innerHTML = '';
    });

    try {
        const response = await fetch('/KOnect/php/instrutor/agenda_get.php', { credentials: 'include' });
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            ordenarAulas(resultado.data).forEach(aula => {
                desenharAulaNaGrade(aula);
            });

            diasDaSemana.forEach(dia => {
                const coluna = document.getElementById(`classes-${dia}`);
                if (coluna && coluna.children.length === 0) {
                    coluna.innerHTML = '<p class="text-muted small text-center mt-3 mb-0">Sem aulas</p>';
                }
            });
        } else {
            alert(resultado.mensagem || 'Erro ao carregar agenda.');
        }
    } catch (erro) {
        console.error('Erro ao carregar a agenda:', erro);
        alert('Erro ao tentar carregar os treinos da semana.');
    }
}

function desenharAulaNaGrade(aula) {
    const coluna = document.getElementById(`classes-${aula.dia}`);
    if (!coluna) return;

    if (coluna.innerHTML.includes('Sem aulas')) {
        coluna.innerHTML = '';
    }

    const cardAula = document.createElement('div');
    cardAula.className = 'class-card';
    cardAula.innerHTML = `
        <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
                <span class="class-time">${escapeHtml(aula.hora)}</span>
                <span class="text-muted d-block mt-1">${escapeHtml(aula.modalidade)}</span>
            </div>
            <div class="d-flex gap-1">
                <button type="button" class="btn btn-sm btn-outline-light btn-editar-aula" title="Editar aula">
                    <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger btn-excluir-aula" title="Excluir aula">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;

    cardAula.querySelector('.btn-editar-aula').addEventListener('click', () => {
        editarAula(aula.id, aula.dia, aula.hora, aula.modalidade);
    });
    cardAula.querySelector('.btn-excluir-aula').addEventListener('click', () => {
        excluirAula(aula.id);
    });

    coluna.appendChild(cardAula);
}

function prepararFormularioAula() {
    const form = document.getElementById('formNovaAula');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const id = formData.get('id');
        const url = id ? '/KOnect/php/instrutor/agenda_alterar.php' : '/KOnect/php/instrutor/agenda_novo.php';
        const btnSubmit = form.querySelector('button[type="submit"]');

        btnSubmit.disabled = true;

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const resultado = await response.json();

            if (resultado.status === 'ok') {
                resetarModalAula();
                await carregarGradeHoraria();

                const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaAula'));
                modal.hide();
            } else {
                alert(resultado.mensagem || 'Erro ao salvar aula.');
            }
        } catch (erro) {
            console.error('Erro ao salvar aula:', erro);
            alert('Erro de conexão ao salvar aula.');
        } finally {
            btnSubmit.disabled = false;
        }
    });
}

function ordenarAulas(aulas) {
    const ordemDias = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

    return [...aulas].sort((aulaA, aulaB) => {
        const ordemDiaA = ordemDias.indexOf(aulaA.dia);
        const ordemDiaB = ordemDias.indexOf(aulaB.dia);

        if (ordemDiaA !== ordemDiaB) return ordemDiaA - ordemDiaB;
        return aulaA.hora.localeCompare(aulaB.hora);
    });
}

function novaAula() {
    resetarModalAula();
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaAula'));
    modal.show();
}

function editarAula(id, dia, hora, modalidade) {
    document.getElementById('agendaId').value = id;
    document.getElementById('diaAula').value = dia;
    document.getElementById('horaAula').value = hora;
    document.getElementById('modalidadeAula').value = modalidade;
    document.getElementById('tituloModalAula').textContent = 'Editar Aula';
    document.getElementById('btnSalvarAulaTexto').textContent = 'Atualizar Aula';

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaAula'));
    modal.show();
}

async function excluirAula(id) {
    if (!confirm('Deseja excluir esta aula da agenda?')) return;

    const formData = new FormData();
    formData.append('id', id);

    try {
        const response = await fetch('/KOnect/php/instrutor/agenda_excluir.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const resultado = await response.json();

        if (resultado.status === 'ok') {
            await carregarGradeHoraria();
        } else {
            alert(resultado.mensagem || 'Erro ao excluir aula.');
        }
    } catch (erro) {
        console.error('Erro ao excluir aula:', erro);
        alert('Erro de conexão ao excluir aula.');
    }
}

function resetarModalAula() {
    const form = document.getElementById('formNovaAula');
    form.reset();
    document.getElementById('agendaId').value = '';
    document.getElementById('tituloModalAula').textContent = 'Agendar Aula';
    document.getElementById('btnSalvarAulaTexto').textContent = 'Salvar Aula';
}

function escapeHtml(valor) {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
