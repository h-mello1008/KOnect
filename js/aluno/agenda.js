document.addEventListener('DOMContentLoaded', () => {
  carregarAgendaAluno();
});

async function carregarAgendaAluno() {
  const diasDaSemana = ['seg', 'ter', 'qua', 'qui', 'sex'];

  diasDaSemana.forEach((dia) => {
    const coluna = document.getElementById(`aulas-aluno-${dia}`);
    if (coluna) coluna.innerHTML = '';
  });

  try {
    const response = await fetch('/KOnect/php/aluno/agenda_get.php', { credentials: 'include' });
    const resultado = await response.json();
    const aulas = resultado.status === 'ok' && Array.isArray(resultado.data) ? resultado.data : [];

    ordenarAulas(aulas).forEach((aula) => {
      desenharAulaAluno(aula.dia, aula.hora, aula.modalidade);
    });
  } catch (erro) {
    console.error('Erro ao carregar agenda do aluno:', erro);
  }

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
    <span class="class-time">${escapeHtml(hora)}</span>
    <span class="text-muted d-block mt-1">${escapeHtml(modalidade)}</span>
  `;

  coluna.appendChild(cardAula);
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

function escapeHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
