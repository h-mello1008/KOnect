(function initInstrutor() {
  if (!localStorage.getItem('instrutor_academia')) {
    const instrutorPadrao = {
      email: 'instrutor@konect.com',
      senha: 'instrutor123'
    };
    localStorage.setItem('instrutor_academia', JSON.stringify([instrutorPadrao]));
  }
})();

document.getElementById('formLoginInstrutor').addEventListener('submit', function (e) {
  e.preventDefault();

  const email   = document.getElementById('emailLoginInstrutor').value;
  const senha   = document.getElementById('senhaLoginInstrutor').value;
  const msgErro = document.getElementById('msgErro');

  const listaInstrutores = JSON.parse(localStorage.getItem('instrutor_academia'));

  const instrutorEncontrado = listaInstrutores.find(
    (instrutor) => instrutor.email === email && instrutor.senha === senha
  );

  if (instrutorEncontrado) {
    localStorage.setItem('instrutor_logado', JSON.stringify(instrutorEncontrado));
    window.location.href = '../cadastro_aluno/index.html';
  } else {
    msgErro.textContent   = 'E-mail e/ou senha incorretos.';
    msgErro.style.display = 'block';
  }
});
