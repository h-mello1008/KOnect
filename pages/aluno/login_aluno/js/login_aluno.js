document.getElementById('formLoginAluno').addEventListener('submit', (e) => {
    e.preventDefault();

    let emailLogin = document.getElementById('emailLogin').value;
    let senhaLogin = document.getElementById('senhaLogin').value;

    let listaAlunos = JSON.parse(localStorage.getItem('alunos_academia')) || [];

    let alunoEncontrado = listaAlunos.find((aluno) => 
        aluno.email === emailLogin 
        && aluno.senha === senhaLogin
    );

    if (alunoEncontrado) {
        localStorage.setItem('aluno_logado', JSON.stringify(alunoEncontrado));
        window.location.href = '../perfil_aluno/index.html';
    } else {
        alert("O email e/ou senha estão incorretos.");
    }
});