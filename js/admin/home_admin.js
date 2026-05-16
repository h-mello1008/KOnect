const adminLogado = JSON.parse(localStorage.getItem('admin_logado'));

if (!adminLogado) {
  window.location.href = '../login_admin/login_admin.html';
} else {
  document.getElementById('adminNome').textContent      = adminLogado.nome || adminLogado.email;
  document.getElementById('adminNomeTitle').textContent = adminLogado.nome || 'Administrador';
}

function logout() {
  localStorage.removeItem('admin_logado');
  window.location.href = '../login_admin/login_admin.html';
}
