document.addEventListener('DOMContentLoaded', () => {
    carregarAcademias();
});

async function carregarAcademias() {
    const container = document.getElementById('listaAcademias');
    
    try {
        const response = await fetch('/KOnect/php/instrutor/academia_get.php');
        const resultado = await response.json();
        
        container.innerHTML = '';

        if (resultado.status === 'ok' && resultado.data.length > 0) {
            resultado.data.forEach(acad => {
                desenharAcademiaNaTela(container, acad.id, acad.nome);
            });
        } else {
            container.innerHTML = '<p class="text-center text-muted col-12">Nenhuma academia cadastrada.</p>';
        }
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        container.innerHTML = '<p class="text-center text-danger col-12">Falha ao comunicar com o servidor.</p>';
    }
}

function desenharAcademiaNaTela(container, id, nome) {
    const divCol = document.createElement('div');
    divCol.className = 'col-md-6';
    
    divCol.innerHTML = `
        <div class="stat-card h-100">
            <h4 class="fw-bold mb-2 text-white">
                <i class="bi bi-building me-2 text-danger"></i>${nome}
            </h4>
            <p class="text-muted small mb-3">Unidade operacional registrada no ecossistema.</p>
            
            <div class="mt-3 pt-3 border-top border-dark d-flex justify-content-between align-items-center">
                <span class="badge badge-sucesso px-3 py-1 rounded-pill small">ID: #${id}</span>
                <span class="text-muted small"><i class="bi bi-check-circle-fill text-success me-1"></i>Ativa</span>
            </div>
        </div>
    `;
    
    container.appendChild(divCol);
}