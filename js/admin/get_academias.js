async function buscarAcademias() {
    const tbody = document.getElementById('tabela-corpo');
    const divMensagem = document.getElementById('mensagem');

    
    tbody.innerHTML = '<tr><td colspan="4">Carregando dados...</td></tr>';
    divMensagem.innerText = '';

    try {
        
        const resposta = await fetch('../../../php/admin/get_academias_ativas.php');
        const json = await resposta.json();

        
        tbody.innerHTML = '';

        if (json.status === 'ok') {
            
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
            
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">${json.mensagem}</td></tr>`;
        }

    } catch (erro) {
        
        console.error("Erro na requisição:", erro);
        divMensagem.innerText = "Erro ao tentar comunicar com o servidor.";
        tbody.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', buscarAcademias);
