async function validarSessao() {
  try {
    const response = await fetch("../../../php/valida_sessao.php");
    const resultado = await response.json();

    if (resultado.status === "ok") {
      const usuarioData = resultado.data;
      document.getElementById("adminNome").textContent =
        usuarioData.email || "Administrador";
      document.getElementById("adminNomeTitle").textContent =
        usuarioData.email || "Administrador";
    } else {
      window.location.href = "../../../pages/admin/login_admin/login_admin.html";
    }
  } catch (erro) {
    console.error("Erro ao validar sessão:", erro);
    window.location.href = "../../../pages/admin/login_admin/login_admin.html";
  }
}

validarSessao();

function logout() {
  localStorage.removeItem("admin_logado");
  window.location.href = "../../../index.html";
}

function abrirTab(evt, tabName) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("tab-content--active");
  });
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("tab-btn--active");
  });
  document.getElementById(tabName).classList.add("tab-content--active");
  evt.currentTarget.classList.add("tab-btn--active");
}
