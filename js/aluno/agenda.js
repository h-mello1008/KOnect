document.addEventListener('DOMContentLoaded', () => {
  carregarAgendaAluno();
});

const agendaPadraoAluno = [
  { dia: 'seg', hora: '08:00', modalidade: 'Muay Thai' },
  { dia: 'seg', hora: '19:00', modalidade: 'Sparring' },
  { dia: 'qua', hora: '19:00', modalidade: 'Técnico' },
  { dia: 'sex', hora: '18:00', modalidade: 'Graduados' }
];

function carregarAgendaAluno() {
  const diasDaSemana = ['seg', 'ter', 'qua', 'qui', 'sex'];

  diasDaSemana.forEach((dia) => {
    const coluna = document.getElementById(`aulas-aluno-${dia}`);
    if (coluna) coluna.innerHTML = '';
  });

  const aulasSalvas = JSON.parse(localStorage.getItem('agenda_instrutor') || 'null');
  const aulas = Array.isArray(aulasSalvas) ? aulasSalvas : agendaPadraoAluno;

  ordenarAulas(aulas).forEach((aula) => {
    desenharAulaAluno(aula.dia, aula.hora, aula.modalidade);
  });

  diasDaSemana.forEach((dia) => {
    const coluna = document.getElementById(`aulas-aluno-${dia}`);
    if (coluna && coluna.children.length === 0) {
      coluna.innerHTML = '<p class="text-muted small text-center mt-3 mb-0">Sem aulas</p>';
    }
  });
}

function desenharAulaAluno(dia, hora, modalidade) {
  const coluna = document.getElementById(`aulas-aluno-${dia}`);
  if (!coluna) return;

  const cardAula = document.createElement('div');
  cardAula.className = 'class-card';
  cardAula.innerHTML = `
    <span class="class-time">${hora}</span>
    <span class="text-muted d-block mt-1">${modalidade}</span>
  `;

  coluna.appendChild(cardAula);
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
