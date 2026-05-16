(function initAluno() {
  if (!localStorage.getItem('alunos_academia')) {
    const alunoPadrao = {
      email: 'aluno@konect.com',
      senha: 'aluno123'
    };
    localStorage.setItem('alunos_academia', JSON.stringify([alunoPadrao]));
  }
})();

document.getElementById('formLoginAluno').addEventListener('submit', function (e) {
  e.preventDefault();

  const email   = document.getElementById('emailLogin').value;
  const senha   = document.getElementById('senhaLogin').value;
  const msgErro = document.getElementById('msgErro');

  const listaAlunos = JSON.parse(localStorage.getItem('alunos_academia'));

  const alunoEncontrado = listaAlunos.find((aluno) => aluno.email === email && aluno.senha === senha);

  if (alunoEncontrado) {
    localStorage.setItem('aluno_logado', JSON.stringify(alunoEncontrado));
    window.location.href = '../perfil_aluno/index.html';
  } else {
    msgErro.textContent   = 'E-mail e/ou senha incorretos.';
    msgErro.style.display = 'block';
  }
});
