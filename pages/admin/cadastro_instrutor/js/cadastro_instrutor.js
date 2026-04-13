document.getElementById('formCadastroInstrutor').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const form = e.target;

    const instrutorData = {
        nome: form.querySelector('[name="nome"]').value,
        email: form.querySelector('[name="email"]').value,
        senha: form.querySelector('[name="senha"]').value,
        telefone_responsavel: form.querySelector('[name="telefone_responsavel"]').value,
        cpf: form.querySelector('[name="cpf"]').value,
        dataNascimento: form.querySelector('[name="data_nascimento"]').value,
        nome_fantasia: form.querySelector('[name="nome_fantasia"]').value,
        razao_social: form.querySelector('[name="razao_social"]').value,
        cnpj: form.querySelector('[name="cnpj"]').value,
        horario_abertura: form.querySelector('[name="horario_abertura"]').value,
        horario_fechamento: form.querySelector('[name="horario_fechamento"]').value,
        telefone_academia: form.querySelector('[name="telefone_academia"]').value,
        periodo_contrato: form.querySelector('[name="periodo_contrato"]:checked').value,
        renovacao_automatica: form.querySelector('[name="renovacao_automatica"]').value,
        aceitou_termos: form.querySelector('[name="aceite_termos"]').checked
    }

    let listaInstrutores = JSON.parse(localStorage.getItem('instrutor_academia')) || [];

    listaInstrutores.push(instrutorData);

    localStorage.setItem('instrutor_academia', JSON.stringify(listaInstrutores));
    alert("Academia/Instrutor salvo com sucesso!");
    form.reset();
});