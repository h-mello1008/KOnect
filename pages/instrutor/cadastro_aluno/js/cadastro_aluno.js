document.getElementById('formCadastroAluno').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const form = e.target;

    const alunoData = {
        nome: form.querySelector('[name="nome"]').value,
        email: form.querySelector('[name="email"]').value,
        senha: form.querySelector('[name="senha"]').value,
        telefone: form.querySelector('[name="telefone"]').value,
        redeSocial: form.querySelector('[name="instagram"]').value,
        dataNascimento: form.querySelector('[name="data_nascimento"]').value,
        peso: form.querySelector('[name="peso"]').value,
        horarioPreferencial: form.querySelector('[name="horario_treino"]').value,
        tagCor: form.querySelector('[name="cor_identificacao"]').value,
        mesInicio: form.querySelector('[name="mes_inicio"]').value,
        plano: form.querySelector('[name="plano"]:checked').value,
        aceitou_termos: form.querySelector('[name="aceite_termos"]').checked,
        atestadoMedico: form.querySelector('[name="atestado_medico"]').files[0]?.name || "Sem atestado",
    }

    let listaAlunos = JSON.parse(localStorage.getItem('alunos_academia')) || [];

    listaAlunos.push(alunoData);

    localStorage.setItem('alunos_academia', JSON.stringify(listaAlunos));
    alert("Aluno salvo com sucesso!");
    form.reset();

    document.getElementById('valorNivel').textContent = '5';
})

const rangeInput = document.getElementById('rangeNivel');
const valorDisplay = document.getElementById('valorNivel');

rangeInput.addEventListener('input', function() {
    valorDisplay.textContent = this.value;
});