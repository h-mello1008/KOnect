// Dashboard Aluno - KOnect Platform
// Script for student dashboard functionality

document.addEventListener("DOMContentLoaded", function () {
  // Initialize dashboard
  validarSessao();
  setupEventListeners();
});

async function validarSessao() {
  try {
    const response = await fetch("../../../php/valida_sessao.php");
    const resultado = await response.json();

    if (resultado.status === "ok") {
      const usuarioData = resultado.data;
      document.getElementById("userName").textContent =
        usuarioData.email || "Aluno";
      loadUserProgress();
    } else {
      window.location.href = "../../../pages/aluno/login_aluno/index.html";
    }
  } catch (erro) {
    console.error("Erro ao validar sessão:", erro);
    window.location.href = "../../../pages/aluno/login_aluno/index.html";
  }
}

function loadUserProgress() {
  // Load student progress data
  const userCourse = localStorage.getItem("userCourse") || "Curso";
  document.getElementById("userCourse").textContent = userCourse;

  // Update progress bar
  const progress = localStorage.getItem("userProgress") || 0;
  updateProgressBar(progress);
}

function updateProgressBar(percentage) {
  const progressFill = document.getElementById("progressBar");
  if (progressFill) {
    progressFill.style.width = percentage + "%";
  }
}

function setupEventListeners() {
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      logout();
    });
  }
}

function logout() {
  // Clear session data
  localStorage.removeItem("aluno_logado");
  localStorage.removeItem("userCourse");
  localStorage.removeItem("userProgress");

  // Redirect to home
  window.location.href = "../../../index.html";
}
