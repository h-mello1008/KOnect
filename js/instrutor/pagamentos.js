document.addEventListener('DOMContentLoaded', () => {
    carregarTabelaPagamentos();
});

async function carregarTabelaPagamentos() {
    const tbody = document.getElementById('tabelaPagamentos');

    try {
        // Reutilizamos a rota de alunos, pois o status financeiro (Ativo/Inativo/Bloqueado) está nela
        const response = await fetch('/KOnect/php/instrutor/aluno_get.php');
        const resultado = await response.json();
        
        tbody.innerHTML = ''; // Limpa a tabela

        if (resultado.status === 'ok' && resultado.data.length > 0) {
            resultado.data.forEach(aluno => {
                
                // Lógica simples para definir o texto e a cor da badge
                let classeBadge = 'badge-sucesso';
                let textoStatus = 'Em Dia';

                if (aluno.status === 'Inativo') {
                    classeBadge = 'badge-alerta';
                    textoStatus = 'Pendente';
                } else if (aluno.status === 'Bloqueado') {
                    classeBadge = 'badge-perigo';
                    textoStatus = 'Inadimplente';
                }

                // Inserção limpa e direta de HTML, sem confusão
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fw-bold text-white">${aluno.nome}</td>
                    <td class="text-muted text-uppercase small">${aluno.plano || 'Mensal'}</td>
                    <td class="text-center">
                        <span class="badge ${classeBadge} px-3 py-2 rounded-pill">${textoStatus}</span>
                    </td>
                    <td class="text-end pe-4">
                        <button class="btn btn-sm btn-outline-danger" onclick="cobrarAluno('${aluno.nome}')">
                            <i class="bi bi-bell-fill"></i> Notificar
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">Nenhum registro encontrado.</td></tr>';
        }
    } catch (erro) {
        console.error('Erro:', erro);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Erro ao comunicar com o servidor.</td></tr>';
    }
}

function cobrarAluno(nomeAluno) {
    // Função simples para o futuro (pode disparar um email via PHP)
    alert(`Aviso de cobrança enviado para o aluno: ${nomeAluno}`);
}