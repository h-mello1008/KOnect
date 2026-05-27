document.addEventListener('DOMContentLoaded', () => {
    carregarMeuProgresso();
});

async function carregarMeuProgresso() {
    const container = document.getElementById('containerGraduacao');

    try {
        // 1. PRIMEIRO PASSO: Descobrir o ID do aluno logado validando a sessão
        const resSessao = await fetch('../../../php/valida_sessao.php', { credentials: 'include' });
        const jsonSessao = await resSessao.json();

        // Se não estiver logado, manda pro login
        if (jsonSessao.status !== 'ok') {
            window.location.href = '../login_aluno/index.html';
            return;
        }

        // Pega o ID que veio da sessão (verifique se no seu jsonSessao o ID vem como .id ou .id_usuario)
        const meuId = jsonSessao.data.id; 

        // 2. SEGUNDO PASSO: Reutilizar o PHP do instrutor passando o nosso próprio ID
        const response = await fetch(`/KOnect/php/instrutor/aluno_progresso_faixa.php?id=${meuId}`);
        const json = await response.json();

        if (json.status === 'ok') {
            desenharProgresso(container, json.data);
        } else {
            container.innerHTML = `<div class="stat-card text-center"><p class="text-danger">${json.mensagem}</p></div>`;
        }
    } catch (erro) {
        console.error(erro);
        container.innerHTML = `<div class="stat-card text-center"><p class="text-danger">Erro ao conectar com o servidor.</p></div>`;
    }
}

function desenharProgresso(container, data) {
    const presencas = data.presencas;
    const meta = data.meta_aulas;
    
    let porcentagem = 0;
    let textoRodape = "";
    let htmlProximaFaixa = "";

    if (data.proxima_faixa) {
        porcentagem = meta > 0 ? Math.floor((presencas / meta) * 100) : 0;
        if (porcentagem > 100) porcentagem = 100;
        
        let aulasFaltantes = meta - presencas;
        if (aulasFaltantes <= 0) {
            textoRodape = `<span class="text-success fw-bold"><i class="bi bi-check-circle-fill"></i> Você está apto para o próximo exame! OSS!</span>`;
            porcentagem = 100;
        } else {
            textoRodape = `Faltam <strong class="text-white">${aulasFaltantes} aulas</strong> para sua próxima graduação.`;
        }
        
        htmlProximaFaixa = `<div class="text-muted small mt-2">Próxima Meta: <span class="text-white fw-bold">${data.proxima_faixa}</span></div>`;
    } else {
        porcentagem = 100;
        textoRodape = `<span class="text-warning fw-bold"><i class="bi bi-star-fill"></i> Você alcançou a graduação máxima no sistema.</span>`;
    }

    container.innerHTML = `
        <div class="stat-card">
            <div class="row align-items-center g-4">
                <div class="col-md-4 text-center border-md-end border-secondary">
                    <div class="fs-1 mb-2">🥋</div>
                    <span class="text-muted small d-block mb-1">Faixa Atual</span>
                    <h3 class="fw-bold text-danger text-uppercase mb-0">${data.faixa_atual}</h3>
                    ${htmlProximaFaixa}
                </div>
                
                <div class="col-md-8">
                    <h5 class="fw-bold text-white mb-4">Requisitos de Evolução</h5>
                    
                    <div class="mb-2 d-flex justify-content-between small">
                        <span class="text-muted">Aulas Assistidas: <strong class="text-white">${presencas}/${meta}</strong></span>
                        <span class="text-white fw-bold">${porcentagem}%</span>
                    </div>
                    
                    <div class="progress-bar-custom mb-3" style="height: 15px;">
                        <div class="progress-fill" style="width: ${porcentagem}%"></div>
                    </div>
                    
                    <p class="text-center small mb-0" style="color: var(--text-muted);">${textoRodape}</p>
                </div>
            </div>
        </div>
    `;
}