document.addEventListener('DOMContentLoaded', () => {
    carregarGradeHoraria();
});

async function carregarGradeHoraria() {
    const diasDaSemana = ['seg', 'ter', 'qua', 'qui', 'sex'];
    diasDaSemana.forEach(dia => {
        const coluna = document.getElementById(`classes-${dia}`);
        if(coluna) coluna.innerHTML = ''; 
    });

    try {
        
        
        
        
        
        const resultado = {
            status: 'ok',
            data: [
                { dia: 'seg', hora: '08:00', modalidade: 'Muay Thai' },
                { dia: 'seg', hora: '19:00', modalidade: 'Sparring' },
                { dia: 'qua', hora: '19:00', modalidade: 'Técnico' },
                { dia: 'sex', hora: '18:00', modalidade: 'Graduados' }
            ]
        };

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

function novaAula() {
    alert("Para a prova de autoria: Aqui podemos abrir um Modal simples com um <form> para adicionar Dia, Hora e Tipo de Treino usando o padrão FormData!");
}
