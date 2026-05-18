// Função responsável por buscar e exibir os dados
async function buscarAcademias() {
    const tbody = document.getElementById('tabela-corpo');
    const divMensagem = document.getElementById('mensagem');

    // Mensagem de carregamento enquanto aguarda o servidor
    tbody.innerHTML = '<tr><td colspan="4">Carregando dados...</td></tr>';
    divMensagem.innerText = '';

    try {
        // Chama o arquivo PHP que retorna o JSON
        const resposta = await fetch('academia_get_ativas.php');
        const json = await resposta.json();

        // Limpa a tabela para inserir os novos dados
        tbody.innerHTML = '';

        if (json.status === 'ok') {
            // Percorre o array 'data' e cria uma linha para cada academia
            json.data.forEach(academia => {
                const tr = document.createElement('tr');
                
                tr.innerHTML = `
                    <td>${academia.id}</td>
                    <td>${academia.nome}</td>
                    <td>${academia.responsavel}</td>
                    <td style="color: green; font-weight: bold;">Ativa</td>
                `;
                
                tbody.appendChild(tr);
            });
            divMensagem.innerText = json.mensagem;
        } else {
            // Caso o status seja 'nok' (nenhuma academia ativa)
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">${json.mensagem}</td></tr>`;
        }

    } catch (erro) {
        // Tratamento de erro caso o PHP não seja encontrado ou dê erro no servidor
        console.error("Erro na requisição:", erro);
        divMensagem.innerText = "Erro ao tentar comunicar com o servidor.";
        tbody.innerHTML = '';
    }
}

// Executa a função automaticamente assim que a página terminar de carregar
document.addEventListener('DOMContentLoaded', buscarAcademias);