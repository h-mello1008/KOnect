document.getElementById('formLoginAluno').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email   = document.getElementById('emailLogin').value;
  const senha   = document.getElementById('senhaLogin').value;
  const msgErro = document.getElementById('msgErro');

  const formData = new FormData();
  formData.append('email', email);
  formData.append('senha', senha);

  try {
    const response = await fetch('../../../php/usuario/usuario_login.php', {
      method: 'POST',
      body: formData
    });

    const resultado = await response.json();

    if (resultado.status === 'ok') {
      localStorage.setItem('aluno_logado', JSON.stringify(resultado.data));
      window.location.href = '../../../pages/aluno/perfil_aluno/index.html';
    } else {
      msgErro.textContent   = resultado.mensagem || 'E-mail e/ou senha incorretos.';
      msgErro.style.display = 'block';
    }
  } catch (erro) {
    msgErro.textContent   = 'Erro ao conectar com o servidor.';
    msgErro.style.display = 'block';
    console.error('Erro:', erro);
  }
});
