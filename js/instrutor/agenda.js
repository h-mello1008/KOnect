document.addEventListener('DOMContentLoaded', () => {
    prepararFormularioNovaAula();
    carregarGradeHoraria();
});

const agendaPadrao = [
    { dia: 'seg', hora: '08:00', modalidade: 'Muay Thai' },
    { dia: 'seg', hora: '19:00', modalidade: 'Sparring' },
    { dia: 'qua', hora: '19:00', modalidade: 'Técnico' },
    { dia: 'sex', hora: '18:00', modalidade: 'Graduados' }
];

async function carregarGradeHoraria() {
    const diasDaSemana = ['seg', 'ter', 'qua', 'qui', 'sex'];
    diasDaSemana.forEach(dia => {
        const coluna = document.getElementById(`classes-${dia}`);
        if(coluna) coluna.innerHTML = '';
    });

    try {
        const aulasSalvas = JSON.parse(localStorage.getItem('agenda_instrutor') || 'null');
        const aulas = Array.isArray(aulasSalvas) ? aulasSalvas : agendaPadrao;
        const resultado = { status: 'ok', data: ordenarAulas(aulas) };

        if (resultado.status === 'ok') {
            resultado.data.forEach(aula => {
                desenharAulaNaGrade(aula.dia, aula.hora, aula.modalidade);
            });
        }
    } catch (erro) {
        console.error("Erro ao carregar a agenda:", erro);
        alert("Erro ao tentar carregar os treinos da semana.");
    }
}

function desenharAulaNaGrade(dia, hora, modalidade) {
    const coluna = document.getElementById(`classes-${dia}`);
    if (!coluna) return;

    const cardAula = document.createElement('div');
    cardAula.className = 'class-card';

    cardAula.innerHTML = `
        <span class="class-time">${hora}</span>
        <span class="text-muted d-block mt-1">${modalidade}</span>
    `;

    coluna.appendChild(cardAula);
}

function prepararFormularioNovaAula() {
    const form = document.getElementById('formNovaAula');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const novaAulaData = {
            dia: formData.get('dia'),
            hora: formData.get('hora'),
            modalidade: formData.get('modalidade').trim()
        };

        const aulasSalvas = JSON.parse(localStorage.getItem('agenda_instrutor') || 'null');
        const aulas = Array.isArray(aulasSalvas) ? aulasSalvas : [...agendaPadrao];
        aulas.push(novaAulaData);

        localStorage.setItem('agenda_instrutor', JSON.stringify(aulas));
        carregarGradeHoraria();
        form.reset();

        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaAula'));
        modal.hide();
    });
}

function ordenarAulas(aulas) {
    const ordemDias = ['seg', 'ter', 'qua', 'qui', 'sex'];

    return [...aulas].sort((aulaA, aulaB) => {
        const ordemDiaA = ordemDias.indexOf(aulaA.dia);
        const ordemDiaB = ordemDias.indexOf(aulaB.dia);

        if (ordemDiaA !== ordemDiaB) return ordemDiaA - ordemDiaB;
        return aulaA.hora.localeCompare(aulaB.hora);
    });
}

function novaAula() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalNovaAula'));
    modal.show();
}
