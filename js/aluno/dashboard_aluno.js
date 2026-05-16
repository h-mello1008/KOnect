// Dashboard Aluno - KOnect Platform
// Script for student dashboard functionality

document.addEventListener("DOMContentLoaded", function () {
  // Initialize dashboard
  loadUserData();
  loadUserProgress();
  setupEventListeners();
});

function loadUserData() {
  // Load user information from session/storage
  const userName = localStorage.getItem("userName") || "Aluno";
  document.getElementById("userName").textContent = userName;
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
  localStorage.removeItem("userName");
  localStorage.removeItem("userCourse");
  localStorage.removeItem("userProgress");

  // Redirect to home
  window.location.href = "../../index.html";
}
