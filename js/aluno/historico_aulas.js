document.addEventListener('DOMContentLoaded', () => {
    carregarHistoricoPresencas();
});

async function carregarHistoricoPresencas() {
    const lista = document.getElementById('listaHistoricoAulas');

    try {
        const response = await fetch('/KOnect/php/aluno/aluno_historico_get.php', { credentials: 'include' });
        const resultado = await response.json();

        lista.innerHTML = '';

        if (resultado.status === 'ok' && resultado.data.length > 0) {
            resultado.data.forEach(aula => {
                desenharLinhaPresenca(lista, aula);
            });
        } else {
            lista.innerHTML = `
                <li class="list-group-item bg-transparent text-center text-muted py-5 border-0">
                    <i class="bi bi-emoji-smile fs-1 d-block mb-3" style="color: var(--accent);"></i>
                    <h5 class="fw-bold text-white mb-1">Bem-vindo ao tatame!</h5>
                    <p class="small text-uppercase">VOCÊ AINDA NÃO POSSUI PRESENÇAS REGISTRADAS. BOM TREINO!</p>
                </li>
            `;
        }
    } catch (erro) {
        console.error("Erro na requisição:", erro);
        lista.innerHTML = '<li class="list-group-item bg-transparent text-center text-danger py-4 border-0">Falha ao carregar o histórico de aulas.</li>';
    }
}

// FUNÇÃO 2: Lógica Visual (Injeta estritamente a linha formatada no DOM)
function desenharLinhaPresenca(lista, aula) {
    // Transforma a data do MySQL (AAAA-MM-DD) para padrão BR (DD/MM/AAAA)
    const dataBR = new Date(aula.dataPresenca).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    
    // Define cores e textos dinâmicos de forma limpa via operadores ternários rápidos
    const ehPresenca  = (aula.presenca == 1);
    const classeCor   = ehPresenca ? 'text-success' : 'text-warning';
    const textoStatus = ehPresenca ? 'Presente' : 'Falta Justificada';
    const classeIcone = ehPresenca ? 'bi-check-circle-fill' : 'bi-info-circle-fill';

    const li = document.createElement('li');
    li.className = 'list-group-item bg-transparent text-white border-secondary d-flex justify-content-between align-items-center py-3';
    
    li.innerHTML = `
        <div>
            <span class="d-block fw-bold"><i class="bi bi-calendar-event me-2"></i>${dataBR}</span>
            <span class="small text-muted">${aula.conteudo_treinado || 'Treino Regular Supervisionado'}</span>
        </div>
        <span class="${classeCor} fw-bold small"><i class="bi ${classeIcone} me-1"></i>${textoStatus}</span>
    `;

    lista.appendChild(li);
}