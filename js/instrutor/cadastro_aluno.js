document.getElementById('formCadastroAluno').addEventListener('submit', async (e) => {
    e.preventDefault();

    const instrutorLogado = JSON.parse(localStorage.getItem('instrutor_logado') || '{}');
    if (!instrutorLogado.id) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/KOnect/pages/instrutor/login_instrutor/login_instrutor.html';
        return;
    }

    const form = e.target;

    const alunoData = {
        nome: form.querySelector('[name="nome"]').value,
        email: form.querySelector('[name="email"]').value,
        senha: form.querySelector('[name="senha"]').value,
        telefone: form.querySelector('[name="telefone"]').value,
        redeSocial: form.querySelector('[name="instagram"]').value,
        peso: form.querySelector('[name="peso"]').value,
        dataNascimento: form.querySelector('[name="data_nascimento"]').value,
        horarioPreferencial: form.querySelector('[name="horario_treino"]').value,
        tagCor: form.querySelector('[name="cor_identificacao"]').value,
        nivelCondicionamento: form.querySelector('[name="nivel_condicionamento"]').value,
        mesInicio: form.querySelector('[name="mes_inicio"]').value,
        plano: form.querySelector('[name="plano"]:checked').value,
        aceitou_termos: form.querySelector('[name="aceite_termos"]').checked ? 1 : 0,
        atestadoMedico: form.querySelector('[name="atestado_medico"]').files[0]?.name ? 1 : 0,
        graduacao_id: null,
        instrutor_id: instrutorLogado.id
    };

    const formData = new FormData();
    Object.keys(alunoData).forEach(key => {
        formData.append(key, alunoData[key]);
    });

    try {
        const response = await fetch('/KOnect/php/aluno/aluno_novo.php', {
            method: 'POST',
            body: formData
        });

        const resultado = await response.json();

        if (resultado.status === 'ok') {
            alert("Aluno salvo com sucesso!");
            window.location.href = '/KOnect/pages/instrutor/alunos.html';
        } else {
            alert('Erro: ' + resultado.mensagem);
        }
    } catch (erro) {
        alert('Erro ao salvar aluno: ' + erro.message);
    }
});

const rangeInput = document.getElementById('rangeNivel');
const valorDisplay = document.getElementById('valorNivel');

rangeInput.addEventListener('input', function() {
    valorDisplay.textContent = this.value;
});