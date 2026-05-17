document.getElementById('formCadastroInstrutor').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = e.target;

    const instrutorData = {
        nome: form.querySelector('[name="nome"]').value,
        telefone: form.querySelector('[name="telefone_responsavel"]').value,
        cpf: form.querySelector('[name="cpf"]').value,
        dataNascimento: form.querySelector('[name="data_nascimento"]').value,
        nome_fantasia: form.querySelector('[name="nome_fantasia"]').value,
        razao_social: form.querySelector('[name="razao_social"]').value,
        cnpj: form.querySelector('[name="cnpj"]').value,
        horario_abertura: form.querySelector('[name="horario_abertura"]').value,
        horario_fechamento: form.querySelector('[name="horario_fechamento"]').value,
        periodo_contrato: form.querySelector('[name="periodo_contrato"]:checked').value,
        aceitou_termos: form.querySelector('[name="aceite_termos"]').checked ? 1 : 0,
        email: form.querySelector('[name="email"]').value,
        senha: form.querySelector('[name="senha"]').value,
        academia_id: null
    };

    const formData = new FormData();
    Object.keys(instrutorData).forEach(key => {
        formData.append(key, instrutorData[key]);
    });

    try {
        const response = await fetch('../../php/instrutor/instrutor_novo.php', {
            method: 'POST',
            body: formData
        });

        const resultado = await response.json();

        if (resultado.status === 'ok') {
            alert('Academia/Instrutor salvo com sucesso!');
            form.reset();
            window.location.href = '../home_admin/index.html';
        } else {
            alert('Erro: ' + resultado.mensagem);
        }
    } catch (erro) {
        alert('Erro ao salvar instrutor: ' + erro.message);
        console.error('Erro:', erro);
    }
});