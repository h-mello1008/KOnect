(function initAdmin() {
  if (!localStorage.getItem('admin_konect')) {
    const adminPadrao = {
      email: 'admin@konect.com',
      senha: 'admin123',
      nome: 'Administrador'
    };
    localStorage.setItem('admin_konect', JSON.stringify(adminPadrao));
  }
})();

document.getElementById('formLoginAdmin').addEventListener('submit', function (a) {
  a.preventDefault();

  const email    = document.getElementById('emailAdmin').value.trim();
  const senha    = document.getElementById('senhaAdmin').value;
  const msgErro  = document.getElementById('msgErro');

  const adminData = JSON.parse(localStorage.getItem('admin_konect'));

  if (adminData && adminData.email === email && adminData.senha === senha) {
    localStorage.setItem('admin_logado', JSON.stringify(adminData));
    window.location.href = '../home_admin/index.html';
  } else {
    msgErro.textContent    = 'E-mail e/ou senha incorretos.';
    msgErro.style.display  = 'block';
  }
});
