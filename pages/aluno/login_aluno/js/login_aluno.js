document.getElementById('formLoginAluno').addEventListener('submit', (e) => {
    e.preventDefault();

    let email = document.getElementById('emailLogin').value;
    let senha = document.getElementById('senhaLogin').value;

    const alunoTeste = {
        nome: "Aluno Teste",
        email: "aluno@konect.com",
        senha: "aluno123",
        telefone: "41999999999",
        redeSocial: "@aluno_teste",
        dataNascimento: "2000-05-15",
        peso: "75",
        horarioPreferencial: "manha",
        tagCor: "#FF5733",
        mesInicio: "2024-01",
        plano: "mensal",
        aceitou_termos: true,
        atestadoMedico: "Sem atestado"
    };

    const listaAlunos = JSON.parse(localStorage.getItem('alunos_academia')) || [alunoTeste];

    const alunoEncontrado = listaAlunos.find((aluno) => aluno.email === email && aluno.senha === senha);

    if (alunoEncontrado) {
        localStorage.setItem("aluno_logado", JSON.stringify(alunoEncontrado));
        window.location.href = '../perfil_aluno/index.html';
    } else {
        alert("E-mail e/ou senha incorretos.");
    }
});